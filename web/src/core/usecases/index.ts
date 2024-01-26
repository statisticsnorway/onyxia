import * as catalog from "./catalog";
import * as deploymentRegionManagement from "./deploymentRegionManagement";
import * as fileExplorer from "./fileExplorer";
import * as secretExplorer from "./secretExplorer";
import * as launcher from "./launcher";
import * as restorableConfigManagement from "./restorableConfigManagement";
import * as s3ConfigCreation from "./s3ConfigCreation";
import * as s3ConfigManagement from "./s3ConfigManagement";
import * as serviceManagement from "./serviceManagement";
import * as userAuthentication from "./userAuthentication";
import * as userConfigs from "./userConfigs";
import * as secretsEditor from "./secretsEditor";
import * as s3CodeSnippets from "./s3CodeSnippets";
import * as k8sCodeSnippets from "./k8sCodeSnippets";
import * as vaultCredentials from "./vaultCredentials";
import * as sqlOlapShell from "./sqlOlapShell";
import * as dataExplorer from "./dataExplorer";
import * as projectManagement from "./projectManagement";

export const usecases = {
    catalog,
    deploymentRegionManagement,
    fileExplorer,
    secretExplorer,
    launcher,
    restorableConfigManagement,
    s3ConfigCreation,
    s3ConfigManagement,
    serviceManagement,
    userAuthentication,
    userConfigs,
    secretsEditor,
    s3CodeSnippets,
    k8sCodeSnippets,
    vaultCredentials,
    sqlOlapShell,
    dataExplorer,
    projectManagement
};
