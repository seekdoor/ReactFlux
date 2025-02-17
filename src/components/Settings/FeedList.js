import {
  Form,
  Input,
  Message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { IconDelete, IconEdit } from "@arco-design/web-react/icon";
import { useState } from "react";

import { deleteFeed, editFeed } from "../../apis";

const FeedList = ({
  feeds,
  groups,
  loading,
  setFeeds,
  setShowFeeds,
  showFeeds,
}) => {
  const [feedModalVisible, setFeedModalVisible] = useState(false);
  const [feedModalLoading, setFeedModalLoading] = useState(false);
  const [feedForm] = Form.useForm();
  const [selectedFeed, setSelectedFeed] = useState({});

  const tableData = showFeeds.map((feed) => ({
    key: feed.id,
    title: feed.title,
    feed_url: feed.feed_url,
    category: feed.category,
    feed: feed,
  }));

  const handleSelectFeed = (record) => {
    setSelectedFeed(record.feed);
    setFeedModalVisible(true);
    feedForm.setFieldsValue({
      title: record.feed.title,
      group: record.feed.category.id,
      crawler: record.feed.crawler,
    });
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      render: (col) => (
        <Typography.Ellipsis expandable={false} showTooltip={true}>
          {col}
        </Typography.Ellipsis>
      ),
    },
    {
      title: "Url",
      dataIndex: "feed_url",
      render: (col) => (
        <Typography.Ellipsis expandable={false} showTooltip={true}>
          {col}
        </Typography.Ellipsis>
      ),
    },
    {
      title: "Group",
      dataIndex: "category.title",
      render: (col) => <Tag>{col}</Tag>,
    },
    {
      title: "Actions",
      dataIndex: "op",
      fixed: "right",
      width: 80,
      render: (col, record) => (
        <Space>
          <span
            className="list-demo-actions-icon"
            role="button"
            tabIndex="0"
            onClick={() => handleSelectFeed(record)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                handleSelectFeed(record);
              }
            }}
            aria-label="Edit this feed"
          >
            <IconEdit />
          </span>
          <Popconfirm
            position="left"
            focusLocka
            title="Unfollow？"
            onOk={async () => {
              const response = await deleteFeed(record.feed.id);
              if (response) {
                setFeeds(feeds.filter((feed) => feed.id !== record.feed.id));
                setShowFeeds(
                  showFeeds.filter((feed) => feed.id !== record.feed.id),
                );
                Message.success("Unfollowed");
              }
            }}
          >
            <span className="list-demo-actions-icon">
              <IconDelete />
            </span>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEditFeed = async (feed_id, newTitle, group_id, is_full_text) => {
    setFeedModalLoading(true);
    const response = await editFeed(feed_id, newTitle, group_id, is_full_text);
    if (response) {
      setFeeds(
        feeds.map((feed) => (feed.id === feed_id ? response.data : feed)),
      );
      setShowFeeds(
        showFeeds.map((feed) => (feed.id === feed_id ? response.data : feed)),
      );
      Message.success("Success");
      setFeedModalVisible(false);
    }
    setFeedModalLoading(false);
    feedForm.resetFields();
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Input.Search
          searchButton
          placeholder="Search feed title"
          onChange={(value) =>
            setShowFeeds(feeds.filter((feed) => feed.title.includes(value)))
          }
          style={{
            width: 300,
            marginBottom: "24px",
          }}
        />
      </div>
      <Table
        columns={columns}
        data={tableData}
        size={"small"}
        loading={loading}
        scroll={{ x: true }}
        style={{ width: "100%" }}
      />
      {selectedFeed && (
        <Modal
          title="Edit Feed"
          visible={feedModalVisible}
          unmountOnExit
          onOk={feedForm.submit}
          style={{ width: "400px" }}
          confirmLoading={feedModalLoading}
          onCancel={() => {
            setFeedModalVisible(false);
            feedForm.resetFields();
          }}
        >
          <Form
            form={feedForm}
            layout="vertical"
            onChange={(value, values) => console.log(value, values)}
            onSubmit={(values) =>
              handleEditFeed(
                selectedFeed.id,
                values.title,
                values.group,
                values.crawler,
              )
            }
            labelCol={{
              span: 7,
            }}
            wrapperCol={{
              span: 17,
            }}
          >
            <Form.Item label="Title" field="title" rules={[{ required: true }]}>
              <Input placeholder="Please input feed title" />
            </Form.Item>
            <Form.Item
              label="Group"
              required
              field="group"
              rules={[{ required: true }]}
            >
              <Select placeholder="Please select">
                {groups.map((group) => (
                  <Select.Option key={group.id} value={group.id}>
                    {group.title}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Fetch original content"
              field="crawler"
              tooltip={<div>Only affects newly retrieved articles</div>}
              style={{ marginBottom: 0 }}
              triggerPropName="checked"
              rules={[{ type: "boolean" }]}
            >
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default FeedList;
