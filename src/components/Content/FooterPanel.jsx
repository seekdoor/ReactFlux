import { Button, Message, Popconfirm, Radio } from "@arco-design/web-react";
import { IconCheck, IconRefresh } from "@arco-design/web-react/icon";
import { forwardRef, useEffect } from "react";

import { useSnapshot } from "valtio";
import {
  contentState,
  setEntries,
  setFilterStatus,
  setFilterString,
  setFilterType,
  setUnreadCount,
  setUnreadEntries,
} from "../../store/contentState";
import { fetchData } from "../../store/dataState";
import "./FooterPanel.css";

const FooterPanel = forwardRef(
  ({ info, refreshArticleList, markAllAsRead }, ref) => {
    const { filterStatus, loading } = useSnapshot(contentState);

    const handleMarkAllAsRead = async () => {
      try {
        await markAllAsRead();
        await fetchData();
        setEntries((prev) =>
          prev.map((entry) => ({ ...entry, status: "read" })),
        );
        setUnreadEntries((prev) =>
          prev.map((entry) => ({ ...entry, status: "read" })),
        );
        setUnreadCount(0);
        Message.success("Marked all as read successfully");
      } catch (error) {
        Message.error("Failed to mark all as read");
      }
    };

    const handleRadioChange = (value) => {
      if (ref.current) {
        ref.current.scrollTo(0, 0);
      }
      setFilterStatus(value);
    };

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
      setFilterType("title");
      setFilterString("");
    }, [filterStatus]);

    return (
      <div className="entry-panel">
        {!["starred", "history"].includes(info.from) && (
          <Popconfirm
            focusLock
            title="Mark All As Read?"
            onOk={handleMarkAllAsRead}
          >
            <Button icon={<IconCheck />} shape="circle" />
          </Popconfirm>
        )}
        <Radio.Group
          disabled={info.from === "history"}
          onChange={(value) => handleRadioChange(value)}
          options={[
            { label: "ALL", value: "all" },
            { label: "UNREAD", value: "unread" },
          ]}
          type="button"
          value={filterStatus}
        />

        <Button
          icon={<IconRefresh />}
          loading={loading}
          shape="circle"
          onClick={refreshArticleList}
        />
      </div>
    );
  },
);

export default FooterPanel;
