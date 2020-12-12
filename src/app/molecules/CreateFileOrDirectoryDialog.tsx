import React, { useMemo, useState, useEffect } from "react";
import { Dialog } from "app/atoms/Dialog";
import { DialogTitle } from "../atoms/DialogTitle";
import { DialogContent } from "app/atoms/DialogContent";
import { DialogActions } from "app/atoms/DialogActions";
import { Button } from "app/atoms/Button";
import { TextField } from "app/atoms/TextField";
import { symToStr } from "app/utils/symToStr";
import { useTranslation } from "app/i18n/useTranslations";
import memoize from "memoizee";

export type Props = {
  /** [HIGHER ORDER] */
  wordForFile: "file" | "secret";

  isOpen: boolean;
  createWhat: "directory" | "file";
  callback(params: { doCreate: false; } | { doCreate: true; name: string; }): void;
  getIsValidName(name: string): boolean;
};

export function CreateFileOrDirectoryDialog(props: Props) {

  const { wordForFile, createWhat, callback, getIsValidName } = props;

  const { t } = useTranslation("CreateFileOrDirectoryDialog");

  const [isOpen, setIsOpen] = useState(props.isOpen);

  useEffect(() => { setIsOpen(props.isOpen); }, [props.isOpen]);

  const [name, setName] = useState("");

  const isValidName = useMemo(() => getIsValidName(name), [name]);

  const onCloseFactory = useMemo(
    () => memoize(
      (doCreate: boolean) =>
        () => {

          setName("");

          setIsOpen(false);

          callback(!doCreate ? { doCreate } : { doCreate, name });

        }
    ),
    [callback, name]
  );

  return (
    <Dialog open={isOpen} onClose={onCloseFactory(false)} aria-labelledby={titleId}>
      <DialogTitle
        id={titleId}
        subtitle={(() => {
          switch (createWhat) {
            case "directory": return t("sort out your", { "what": t(wordForFile) })
            case "file": return null;
          }
        })()}
      >
        {t("create new", { "what": t(createWhat) })}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label={t("name of the", {
            "what": t((() => {
              switch (createWhat) {
                case "directory": return "directory";
                case "file": return wordForFile;
              }
            })())
          })}
          fullWidth
          error={!isValidName}
          onChange={setName}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onCloseFactory(false)}
          color="secondary"
          disabled={!isValidName}
        >
          Cancel
          </Button>
        <Button onClick={onCloseFactory(true)} color="primary">
          Subscribe
          </Button>
      </DialogActions>
    </Dialog>
  );


}

export declare namespace CreateFileOrDirectoryDialog {

  export type I18nScheme = {
    file: undefined,
    secret: undefined,
    directory: undefined,
    create: undefined,
    cancel: undefined,
    'create new': { what: string; };
    'sort out your': { what: string; };
    'name of the': { what: string; };
  };

}

//NOTE: Could be anything, just need to be uniq across the DOM.
const titleId = symToStr({ CreateFileOrDirectoryDialog });



