import React, { createRef, useCallback, useEffect, useState } from "react";
import { Editor } from "./Editor";
import { EditorModes } from "components/editorComponents/CodeEditor/EditorConfig";
import { ButtonContainer, Container } from "./Styles";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/duotone-dark.css";
import "codemirror/theme/duotone-light.css";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/display/placeholder";
import "codemirror/addon/edit/closebrackets";
import "codemirror/addon/display/autorefresh";
import "codemirror/addon/mode/multiplex";
import ExternalComponent from "widgets/ExternalWidget/component";
import { noop } from "lodash";

import { Button } from "design-system";

export default function WidgetBuilder() {
  const [srcDoc, setSrcDoc] = useState({
    html: "",
    css: "",
    js: "",
  });

  const [model, setModel] = useState({});

  const [jsEditorHeight, setJsEditorHeight] = useState(330);

  const [loading, setLoading] = useState(true);

  const preview = createRef<HTMLDivElement>();

  const [previewDimensions, setPreviewDimensions] = useState({
    width: 100,
    height: 100,
  });

  useEffect(() => {
    const handler = (event: any) => {
      if (event.source === window.opener) {
        switch (event.data.type) {
          case "BUILDER_READY_ACK":
            setSrcDoc(event.data.srcDoc);
            setModel(event.data.model);
            setLoading(false);
            break;
        }
      }
    };

    window.addEventListener("message", handler, false);

    window.parent.postMessage(
      {
        type: "BUILDER_READY",
      },
      "*",
    );

    return () => {
      window.removeEventListener("message", handler, false);
    };
  }, []);

  const onUpdate = useCallback(() => {
    window.parent.postMessage(
      {
        type: "BUILDER_UPDATE",
        srcDoc,
      },
      "*",
    );
    window.close();
  }, [srcDoc]);

  const onCancel = useCallback(() => {
    window.parent.postMessage(
      {
        type: "BUILDER_CANCEL",
      },
      "*",
    );
    window.close();
  }, []);

  useEffect(() => {
    const height = window.innerHeight - 150 - 48;

    setJsEditorHeight(height);
  }, []);

  useEffect(() => {
    setPreviewDimensions({
      width: preview.current?.clientWidth || 100,
      height: preview.current?.clientHeight || 200,
    });
  }, [loading]);

  if (loading) {
    return <div>Loading...</div>;
  } else {
    return (
      <>
        <ButtonContainer>
          <Button
            kind="secondary"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onClick={onCancel}
            size="sm"
          >
            cancel
          </Button>
          <Button
            kind="primary"
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            onClick={onUpdate}
            size="sm"
          >
            save
          </Button>
        </ButtonContainer>
        <Container>
          <div className="row">
            <div className="col-6">
              <Editor
                height="130"
                label="HTML"
                mode="htmlmixed"
                onChange={(value: string) =>
                  setSrcDoc({ ...srcDoc, html: value })
                }
                value={srcDoc.html}
                width="250"
              />
            </div>
            <div className="col-6">
              <Editor
                height="130"
                label="css"
                mode="css"
                onChange={(value: string) =>
                  setSrcDoc({ ...srcDoc, css: value })
                }
                value={srcDoc.css}
                width="250"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-6">
              {
                <Editor
                  height={jsEditorHeight}
                  label="JS"
                  mode={EditorModes.JAVASCRIPT}
                  onChange={(value: string) =>
                    setSrcDoc({ ...srcDoc, js: value })
                  }
                  value={srcDoc.js}
                  width="250"
                />
              }
            </div>
            <div className="col-6 preview-window" ref={preview}>
              <ExternalComponent
                execute={noop}
                height={previewDimensions.height}
                model={model}
                srcDoc={srcDoc}
                update={noop}
                width={previewDimensions.width}
              />
            </div>
          </div>
        </Container>
      </>
    );
  }
}
