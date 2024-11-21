// This file is auto-generated by the `update-kc-gen` command. Do not edit it manually.
// Hash: dac5196aa79e53aeae9e5283a7c9ea3141976d0fd8d313beb7986bea3b8c46f4

/* eslint-disable */

// noinspection JSUnusedGlobalSymbols

import { lazy, Suspense, type ReactNode } from "react";

export type ThemeName = "onyxia";

export const themeNames: ThemeName[] = ["onyxia"];

export type KcEnvName =
    | "ONYXIA_RESOURCES_ALLOWED_ORIGINS"
    | "ONYXIA_HEADER_TEXT_BOLD"
    | "ONYXIA_HEADER_TEXT_FOCUS"
    | "ONYXIA_PALETTE_OVERRIDE"
    | "ONYXIA_TAB_TITLE";

export const kcEnvNames: KcEnvName[] = [
    "ONYXIA_RESOURCES_ALLOWED_ORIGINS",
    "ONYXIA_HEADER_TEXT_BOLD",
    "ONYXIA_HEADER_TEXT_FOCUS",
    "ONYXIA_PALETTE_OVERRIDE",
    "ONYXIA_TAB_TITLE"
];

export const kcEnvDefaults: Record<KcEnvName, string> = {
    ONYXIA_RESOURCES_ALLOWED_ORIGINS: "*",
    ONYXIA_HEADER_TEXT_BOLD: "",
    ONYXIA_HEADER_TEXT_FOCUS: "",
    ONYXIA_PALETTE_OVERRIDE: "",
    ONYXIA_TAB_TITLE: "Onyxia"
};

type KcContext = import("./login/KcContext").KcContext;

declare global {
    interface Window {
        kcContext?: KcContext;
    }
}

export const KcLoginPage = lazy(() => import("./login/KcPage"));

export function KcPage(props: { kcContext: KcContext; fallback?: ReactNode }) {
    const { kcContext, fallback } = props;
    return (
        <Suspense fallback={fallback}>
            {(() => {
                switch (kcContext.themeType) {
                    case "login":
                        return <KcLoginPage kcContext={kcContext} />;
                }
            })()}
        </Suspense>
    );
}