import { Button } from "@arco-design/web-react";
import {
  IconArrowLeft,
  IconArrowRight,
  IconClose,
  IconMinusCircle,
  IconRecord,
  IconStar,
  IconStarFill,
} from "@arco-design/web-react/icon";
import { useContext } from "react";

import useEntryActions from "../../hooks/useEntryActions";
import useKeyHandlers from "../../hooks/useKeyHandlers";
import { ContentContext } from "../ContentContext";

export default function ActionButtonsMobile({ handleEntryClick }) {
  const { activeContent } = useContext(ContentContext);
  const { toggleEntryStarred, toggleEntryStatus } = useEntryActions();
  const { handleLeftKey, handleRightKey, handleEscapeKey } = useKeyHandlers();

  return activeContent ? (
    <Button.Group
      className="action-buttons-mobile"
      style={{
        display: "none",
        justifyContent: "center",
        position: "fixed",
        bottom: "40px",
        left: "50%",
        transform: "translateX(-50%)",
        borderRadius: "50%",
        boxShadow: "0 4px 10px rgba(var(--primary-6), 0.4)",
      }}
    >
      <Button
        type="primary"
        shape="round"
        onClick={() => handleEscapeKey(handleEntryClick)}
        icon={<IconClose />}
      />
      <Button
        type="primary"
        onClick={() => toggleEntryStatus()}
        icon={
          activeContent.status === "unread" ? (
            <IconMinusCircle />
          ) : (
            <IconRecord />
          )
        }
      />
      <Button
        type="primary"
        onClick={() => toggleEntryStarred()}
        icon={
          activeContent.starred ? (
            <IconStarFill style={{ color: "#ffcd00" }} />
          ) : (
            <IconStar />
          )
        }
      />
      <Button
        type="primary"
        onClick={() => handleLeftKey(handleEntryClick)}
        icon={<IconArrowLeft />}
      />
      <Button
        type="primary"
        shape="round"
        onClick={() => handleRightKey(handleEntryClick)}
        icon={<IconArrowRight />}
      />
    </Button.Group>
  ) : null;
}
