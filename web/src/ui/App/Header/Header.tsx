import { Button } from "onyxia-ui/Button";
import { ButtonBarButton } from "onyxia-ui/ButtonBarButton";
import { useTranslation } from "ui/i18n";
import { tss } from "tss";
import { env } from "env-parsed";
import { useResolveLocalizedString } from "ui/i18n";
import { declareComponentKeys } from "i18nifty";
import { BrandHeaderSection } from "ui/shared/BrandHeaderSection";
import { routes } from "ui/routes";
import { ProjectSelect } from "./ProjectSelect";
import { RegionSelect } from "./RegionSelect";
import { useCoreFunctions } from "core";
import { session } from "ui/routes";

export type Props = {
    className?: string;
};

export function Header(props: Props) {
    const { className } = props;

    const { t } = useTranslation({ Header });

    const { classes, cx } = useStyles();

    const { resolveLocalizedString } = useResolveLocalizedString({
        "labelWhenMismatchingLanguage": true
    });

    const { userAuthentication } = useCoreFunctions();

    const isUserLoggedIn = userAuthentication.getIsUserLoggedIn();

    return (
        <header className={cx(classes.root, className)}>
            <BrandHeaderSection doShowOnyxia={true} link={routes.home().link} />
            <RegionSelect className={classes.regionSelect} tRegion={t("region")} />
            <ProjectSelect className={classes.projectSelect} tProject={t("project")} />
            <div className={classes.rightEndActionsContainer}>
                {env.HEADER_LINKS.map(({ icon, url, label }) => (
                    <ButtonBarButton
                        key={url}
                        className={classes.button}
                        startIcon={icon}
                        href={url}
                        doOpenNewTabIfHref={!url.startsWith("/")}
                        onClick={
                            !url.startsWith("/")
                                ? undefined
                                : e => {
                                      e.preventDefault();
                                      session.push(url);
                                  }
                        }
                    >
                        {resolveLocalizedString(label)}
                    </ButtonBarButton>
                ))}
                <Button
                    onClick={() => {
                        if (isUserLoggedIn) {
                            userAuthentication.logout({ "redirectTo": "home" });
                        } else {
                            userAuthentication.login({
                                "doesCurrentHrefRequiresAuth": false
                            });
                        }
                    }}
                    variant={isUserLoggedIn ? "secondary" : "primary"}
                    className={classes.loginLogoutButton}
                >
                    {t(isUserLoggedIn ? "logout" : "login")}
                </Button>
            </div>
        </header>
    );
}

export const { i18n } = declareComponentKeys<"logout" | "login" | "project" | "region">()(
    {
        Header
    }
);

const useStyles = tss.withName({ Header }).create(({ theme }) => ({
    "root": {
        "backgroundColor": theme.colors.useCases.surfaces.background,
        "overflow": "auto",
        "display": "flex",
        "alignItems": "center",
        ...theme.spacing.topBottom("padding", 2)
    },
    "button": {
        "marginBottom": theme.spacing(1)
    },
    "loginLogoutButton": {
        "marginLeft": theme.spacing(3)
    },
    "rightEndActionsContainer": {
        "flex": 1,
        "display": "flex",
        "justifyContent": "flex-end",
        "alignItems": "center"
    },
    "projectSelect": {
        "marginLeft": theme.spacing(4)
    },
    "regionSelect": {
        "marginLeft": theme.spacing(4)
    }
}));