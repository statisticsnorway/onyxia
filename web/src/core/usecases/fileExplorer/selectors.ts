import type { State as RootState } from "core/bootstrap";
import memoize from "memoizee";
import { type State, name } from "./state";
import { createSelector } from "clean-architecture";
import * as deploymentRegionManagement from "core/usecases/deploymentRegionManagement";
import * as userConfigs from "core/usecases/userConfigs";
import * as userAuthentication from "core/usecases/userAuthentication";
import * as s3ConfigManagement from "core/usecases/s3ConfigManagement";

const state = (rootState: RootState): State => rootState[name];

type UploadProgress = {
    s3FilesBeingUploaded: State["s3FilesBeingUploaded"];
    overallProgress: {
        completedFileCount: number;
        remainingFileCount: number;
        totalFileCount: number;
        uploadPercent: number;
    };
};

const uploadProgress = createSelector(state, (state): UploadProgress => {
    const { s3FilesBeingUploaded } = state;

    const completedFileCount = s3FilesBeingUploaded.map(
        ({ uploadPercent }) => uploadPercent === 100
    ).length;

    return {
        s3FilesBeingUploaded,
        "overallProgress": {
            completedFileCount,
            "remainingFileCount": s3FilesBeingUploaded.length - completedFileCount,
            "totalFileCount": s3FilesBeingUploaded.length,
            "uploadPercent":
                s3FilesBeingUploaded
                    .map(({ size, uploadPercent }) => size * uploadPercent)
                    .reduce((prev, curr) => prev + curr, 0) /
                s3FilesBeingUploaded
                    .map(({ size }) => size)
                    .reduce((prev, curr) => prev + curr, 0)
        }
    };
});

const commandLogsEntries = createSelector(
    state,
    userConfigs.selectors.userConfigs,
    (state, userConfigs) =>
        !userConfigs.isCommandBarEnabled ? undefined : state.commandLogsEntries
);

type CurrentWorkingDirectoryView = {
    directoryPath: string;
    directories: string[];
    files: string[];
    directoriesBeingCreated: string[];
    filesBeingCreated: string[];
};

const currentWorkingDirectoryView = createSelector(
    state,
    (state): CurrentWorkingDirectoryView | undefined => {
        const { directoryPath, directoryItems, ongoingOperations } = state;

        if (directoryPath === undefined) {
            return undefined;
        }

        return {
            directoryPath,
            ...(() => {
                const selectOngoing = memoize(
                    (kind: "directory" | "file", operation: "create" | "rename") =>
                        ongoingOperations
                            .filter(
                                o =>
                                    o.directoryPath === directoryPath &&
                                    o.kind === kind &&
                                    o.operation === operation
                            )
                            .map(({ basename }) => basename)
                );

                const select = (kind: "directory" | "file") =>
                    [
                        ...directoryItems
                            .filter(item => item.kind === kind)
                            .map(({ basename }) => basename),
                        ...selectOngoing(kind, "create"),
                        ...selectOngoing(kind, "rename")
                    ].sort((a, b) => a.localeCompare(b));

                return {
                    "directories": select("directory"),
                    "files": select("file"),
                    "directoriesBeingCreated": selectOngoing("directory", "create"),
                    "directoriesBeingRenamed": selectOngoing("directory", "rename"),
                    "filesBeingCreated": selectOngoing("file", "create"),
                    "filesBeingRenamed": selectOngoing("file", "rename")
                };
            })()
        };
    }
);

const isNavigationOngoing = createSelector(state, state => state.isNavigationOngoing);

const main = createSelector(
    uploadProgress,
    commandLogsEntries,
    currentWorkingDirectoryView,
    isNavigationOngoing,
    (
        uploadProgress,
        commandLogsEntries,
        currentWorkingDirectoryView,
        isNavigationOngoing
    ) => {
        if (currentWorkingDirectoryView === undefined) {
            return {
                "isCurrentWorkingDirectoryLoaded": false as const,
                isNavigationOngoing,
                uploadProgress,
                commandLogsEntries
            };
        }

        return {
            "isCurrentWorkingDirectoryLoaded": true as const,
            isNavigationOngoing,
            uploadProgress,
            commandLogsEntries,
            currentWorkingDirectoryView
        };
    }
);

const isFileExplorerEnabled = (rootState: RootState) => {
    const deploymentRegion =
        deploymentRegionManagement.selectors.currentDeploymentRegion(rootState);

    if (deploymentRegion.s3?.sts !== undefined) {
        return true;
    }

    const { isUserLoggedIn } =
        userAuthentication.selectors.authenticationState(rootState);

    if (!isUserLoggedIn) {
        return false;
    }

    const { indexForExplorer } =
        s3ConfigManagement.protectedSelectors.projectS3Config(rootState);

    return indexForExplorer !== undefined;
};

const workingDirectoryPath = createSelector(
    s3ConfigManagement.protectedSelectors.projectS3Config,
    s3ConfigManagement.protectedSelectors.baseS3Config,
    (projectS3Config, baseS3Config) => {
        from_project_configs: {
            const { indexForExplorer, customConfigs } = projectS3Config;

            if (indexForExplorer === undefined) {
                break from_project_configs;
            }

            return customConfigs[indexForExplorer].workingDirectoryPath;
        }
        return baseS3Config.workingDirectoryPath;
    }
);

export const protectedSelectors = { workingDirectoryPath };

export const selectors = { main, isFileExplorerEnabled };
