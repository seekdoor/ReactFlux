import { Button, Input, Select, Tooltip } from "@arco-design/web-react";
import {
  IconSortAscending,
  IconSortDescending,
} from "@arco-design/web-react/icon";

import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { useScreenWidth } from "../../hooks/useScreenWidth";
import { configState, updateConfig } from "../../store/configState";
import {
  contentState,
  setFilterString,
  setFilterType,
} from "../../store/contentState";
import "./SearchAndSortBar.css";

const SearchAndSortBar = () => {
  const { orderDirection } = useSnapshot(configState);
  const { filterString, filterType } = useSnapshot(contentState);

  const { belowMd } = useScreenWidth();

  const toggleOrderDirection = () => {
    const newOrderDirection = orderDirection === "desc" ? "asc" : "desc";
    updateConfig({ orderDirection: newOrderDirection });
  };

  useEffect(() => {
    setFilterType("title");
    setFilterString("");
  }, []);

  return (
    <div className="search-and-sort-bar">
      <Input.Search
        allowClear
        onChange={setFilterString}
        placeholder="Search..."
        style={{ width: belowMd ? "100%" : 278, marginLeft: 8 }}
        value={filterString}
        addBefore={
          <Select
            placeholder="Select type"
            onChange={setFilterType}
            style={{ width: 100 }}
            value={filterType}
          >
            <Select.Option value="title">Title</Select.Option>
            <Select.Option value="content">Content</Select.Option>
            <Select.Option value="author">Author</Select.Option>
          </Select>
        }
      />
      <Tooltip
        mini
        content={orderDirection === "desc" ? "Newest first" : "Oldest first"}
      >
        <Button
          shape="circle"
          size="small"
          style={{ margin: "0 8px", flexShrink: 0 }}
          icon={
            orderDirection === "desc" ? (
              <IconSortDescending />
            ) : (
              <IconSortAscending />
            )
          }
          onClick={toggleOrderDirection}
        />
      </Tooltip>
    </div>
  );
};

export default SearchAndSortBar;
