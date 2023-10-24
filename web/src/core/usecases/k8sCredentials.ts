import type { Thunks } from "../core";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { id } from "tsafe/id";
import type { State as RootState } from "../core";
import { createSelector } from "@reduxjs/toolkit";
import * as projectConfigs from "./projectConfigs";
import * as deploymentRegion from "./deploymentRegion";
import { parseUrl } from "core/tools/parseUrl";
import { assert } from "tsafe/assert";
import * as userAuthentication from "./userAuthentication";
import { createOidcOrFallback } from "core/adapters/oidc/utils/createOidcOrFallback";
import { createUsecaseContextApi } from "redux-clean-architecture";
import type { Oidc } from "core/ports/Oidc";
import { symToStr } from "tsafe/symToStr";

type State = State.NotRefreshed | State.Ready;

namespace State {
    type Common = {
        isRefreshing: boolean;
    };

    export type NotRefreshed = Common & {
        stateDescription: "not refreshed";
    };

    export type Ready = Common & {
        stateDescription: "ready";
        idpIssuerUrl: string;
        clientId: string;
        refreshToken: string;
        idToken: string;
        user: string;
        expirationTime: number;
    };
}

export const name = "k8sCredentials";

export const { reducer, actions } = createSlice({
    name,
    "initialState": id<State>(
        id<State.NotRefreshed>({
            "stateDescription": "not refreshed",
            "isRefreshing": false
        })
    ),
    "reducers": {
        "refreshStarted": state => {
            state.isRefreshing = true;
        },
        "refreshed": (
            _state,
            {
                payload
            }: PayloadAction<{
                idpIssuerUrl: string;
                clientId: string;
                refreshToken: string;
                idToken: string;
                user: string;
                expirationTime: number;
            }>
        ) => {
            const {
                idpIssuerUrl,
                clientId,
                refreshToken,
                idToken,
                user,
                expirationTime
            } = payload;

            return id<State.Ready>({
                "isRefreshing": false,
                "stateDescription": "ready",
                idpIssuerUrl,
                clientId,
                refreshToken,
                idToken,
                user,
                expirationTime
            });
        }
    }
});

export const thunks = {
    /** Can, and must be called before the slice is refreshed,
     * tels if the feature is available.
     */
    "getIsAvailable":
        () =>
        (...args): boolean => {
            const [, getState] = args;

            const region = deploymentRegion.selectors.selectedDeploymentRegion(
                getState()
            );

            return region.kubernetes !== undefined;
        },
    /** Refresh is expected to be called whenever the component that use this slice mounts */
    "refresh":
        () =>
        async (...args) => {
            const [dispatch, getState, extraArg] = args;

            const { oidc } = extraArg;

            if (getState().s3Credentials.isRefreshing) {
                return;
            }

            dispatch(actions.refreshStarted());

            const { kubernetes } = deploymentRegion.selectors.selectedDeploymentRegion(
                getState()
            );

            assert(kubernetes !== undefined);

            assert(oidc.isUserLoggedIn);

            const context = getContext(extraArg);

            let { kubernetesOidcClient } = context;

            if (kubernetesOidcClient === undefined) {
                kubernetesOidcClient = await createOidcOrFallback({
                    "oidcAdapterImplementationToUseIfNotFallingBack": "default",
                    "fallbackOidc": oidc,
                    "oidcParams": kubernetes.oidcParams
                });

                context.kubernetesOidcClient = kubernetesOidcClient;
            }

            await kubernetesOidcClient.renewTokens();

            const oidcTokens = kubernetesOidcClient.getTokens();

            dispatch(
                actions.refreshed({
                    "idpIssuerUrl": kubernetesOidcClient.params.issuerUri,
                    "clientId": kubernetesOidcClient.params.clientId,
                    "refreshToken": oidcTokens.refreshToken,
                    "idToken": oidcTokens.idToken,
                    "user": `oidc-${
                        dispatch(userAuthentication.thunks.getUser()).username
                    }`,
                    "expirationTime": oidcTokens.refreshTokenExpirationTime
                })
            );
        }
} satisfies Thunks;

const { getContext } = createUsecaseContextApi<{
    kubernetesOidcClient: Oidc.LoggedIn | undefined;
}>(() => ({
    "kubernetesOidcClient": undefined
}));

export const selectors = (() => {
    const readyState = (rootState: RootState): State.Ready | undefined => {
        const state = rootState.k8sCredentials;
        switch (state.stateDescription) {
            case "ready":
                return state;
            default:
                return undefined;
        }
    };

    const clusterUrl = createSelector(
        deploymentRegion.selectors.selectedDeploymentRegion,
        (selectedDeploymentRegion): string => {
            const { kubernetes } = selectedDeploymentRegion;

            assert(kubernetes !== undefined);

            return kubernetes.url;
        }
    );

    const namespace = createSelector(
        projectConfigs.selectors.selectedProject,
        selectedProject => selectedProject.namespace
    );

    const shellScript = createSelector(
        readyState,
        clusterUrl,
        namespace,
        (state, clusterUrl, namespace) => {
            if (state === undefined) {
                return undefined;
            }

            const { host } = parseUrl(clusterUrl);

            return [
                `kubectl config set-cluster ${host} \\`,
                `  --server=${clusterUrl} \\`,
                `  --insecure-skip-tls-verify=true`,
                ``,
                `kubectl config set-credentials ${state.user} \\`,
                `  --auth-provider=oidc  \\`,
                `  --auth-provider-arg=idp-issuer-url=${state.idpIssuerUrl}  \\`,
                `  --auth-provider-arg=client-id=${state.clientId}  \\`,
                `  --auth-provider-arg=refresh-token=${state.refreshToken} \\`,
                `  --auth-provider-arg=id-token=${state.idToken}`,
                ``,
                `kubectl config set-context ${host} \\`,
                `  --user=${state.user} \\`,
                `  --cluster=${host} \\`,
                `  --namespace=${namespace}`,
                ``,
                `kubectl config use-context ${host}`
            ].join("\n");
        }
    );

    const wrap = createSelector(
        readyState,
        clusterUrl,
        namespace,
        shellScript,
        (state, clusterUrl, namespace, shellScript) => {
            const common = {
                clusterUrl,
                namespace
            };

            let idpIssuerUrl: string | undefined = undefined;
            let clientId: string | undefined = undefined;
            let refreshToken: string | undefined = undefined;
            let idToken: string | undefined = undefined;
            let expirationTime: number | undefined = undefined;
            let isRefreshing: boolean | undefined = undefined;

            if (state === undefined) {
                return {
                    "isReady": false as const,
                    ...common,
                    [symToStr({ idpIssuerUrl })]: undefined,
                    [symToStr({ clientId })]: undefined,
                    [symToStr({ refreshToken })]: undefined,
                    [symToStr({ idToken })]: undefined,
                    [symToStr({ expirationTime })]: undefined,
                    [symToStr({ isRefreshing })]: undefined,
                    [symToStr({ shellScript })]: undefined
                };
            }

            assert(shellScript !== undefined);

            idpIssuerUrl = state.idpIssuerUrl;
            clientId = state.clientId;
            refreshToken = state.refreshToken;
            idToken = state.idToken;
            expirationTime = state.expirationTime;
            isRefreshing = state.isRefreshing;

            return {
                "isReady": true as const,
                ...common,
                idpIssuerUrl,
                clientId,
                refreshToken,
                idToken,
                expirationTime,
                isRefreshing,
                shellScript
            };
        }
    );

    return {
        wrap
    };
})();
