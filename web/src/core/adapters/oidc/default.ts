import { Oidc } from "core/ports/Oidc";
import { createOidc as createOidcSpa } from "oidc-spa";

export async function createOidc(params: {
    issuerUri: string;
    clientId: string;
    transformUrlBeforeRedirect: (url: string) => string;
}): Promise<Oidc> {
    const { issuerUri, clientId, transformUrlBeforeRedirect } = params;

    return createOidcSpa({
        issuerUri,
        clientId,
        transformUrlBeforeRedirect,
        "log": console.log,
        "getExtraQueryParams": () => ({
            // A Google `refresh_token` is only provided during the initial user authorization process, unless prompt is set to consent.
            // See: https://stackoverflow.com/questions/10827920/not-receiving-google-oauth-refresh-token/10857806#10857806
            // Without a Google refresh token, Keycloak/oidc provider is unable to refresh the Google access token during token exchange.
            "prompt": "consent"
        })
    });
}
