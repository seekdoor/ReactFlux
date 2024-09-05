import { Message } from "@arco-design/web-react";
import { useEffect, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

import { useSnapshot } from "valtio";
import { updateEntriesStatus } from "../../apis";
import useEntryActions from "../../hooks/useEntryActions";
import useKeyHandlers from "../../hooks/useKeyHandlers";
import { configState } from "../../store/configState";
import {
  contentState,
  setActiveContent,
  setEntries,
  setInfoFrom,
  setIsArticleFocused,
  setLoadMoreUnreadVisible,
  setLoadMoreVisible,
  setLoading,
  setOffset,
  setTotal,
  setUnreadCount,
  setUnreadEntries,
  setUnreadOffset,
} from "../../store/contentState";
import { dataState, fetchData } from "../../store/dataState";
import { parseFirstImage } from "../../utils/images";
import ArticleDetail from "../Article/ArticleDetail";
import ArticleList from "../Article/ArticleList";
import "./Content.css";
import FooterPanel from "./FooterPanel";
import "./Transition.css";

const Content = ({ info, getEntries, markAllAsRead }) => {
  const { orderBy, orderDirection } = useSnapshot(configState);
  const { activeContent, filteredEntries, isArticleFocused, loading } =
    useSnapshot(contentState);
  const { isAppDataReady } = useSnapshot(dataState);

  const {
    handleFetchContent,
    handleToggleStarred,
    handleToggleStatus,
    handleEntryStatusUpdate,
  } = useEntryActions();

  const [isFirstRenderCompleted, setIsFirstRenderCompleted] = useState(false);

  const entryListRef = useRef(null);
  const cardsRef = useRef(null);

  // 文章详情页的引用
  const entryDetailRef = useRef(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isFirstRenderCompleted || info.from === "history") {
      return;
    }
    refreshArticleList();
  }, [orderBy]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setInfoFrom(info.from);
    refreshArticleList();
  }, [info, orderDirection]);

  const handleEntryClick = (entry) => {
    return new Promise((resolve, reject) => {
      setActiveContent(null);

      if (entry.status !== "unread") {
        setTimeout(() => {
          setActiveContent({ ...entry, status: "read" });
          resolve();
        }, 200);
        return;
      }

      setTimeout(() => {
        setActiveContent({ ...entry, status: "read" });
        handleEntryStatusUpdate(entry, "read");
        updateEntriesStatus([entry.id], "read")
          .then(resolve)
          .catch((error) => {
            Message.error(
              "Failed to mark entry as read, please try again later",
            );
            handleEntryStatusUpdate(entry, "unread");
            reject(error);
          });
      }, 200);
    });
  };

  const {
    exitDetailView,
    fetchOriginalArticle,
    navigateToNextArticle,
    navigateToPreviousArticle,
    openLinkExternally,
    openPhotoSlider,
    toggleReadStatus,
    toggleStarStatus,
  } = useKeyHandlers(handleEntryClick);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const keyMap = {
      ArrowLeft: () => navigateToPreviousArticle(),
      ArrowRight: () => navigateToNextArticle(),
      Escape: () => exitDetailView(entryListRef, entryDetailRef),
      b: () => openLinkExternally(),
      d: () => fetchOriginalArticle(handleFetchContent),
      m: () => toggleReadStatus(() => handleToggleStatus(activeContent)),
      s: () => toggleStarStatus(() => handleToggleStarred(activeContent)),
      v: () => openPhotoSlider(),
    };

    const handleKeyDown = (event) => {
      const handler = keyMap[event.key];
      if (handler) {
        if (event.key === "ArrowLeft") {
          navigateToPreviousArticle(event.ctrlKey);
        } else if (event.key === "ArrowRight") {
          navigateToNextArticle(event.ctrlKey);
        } else {
          handler();
        }
      }
    };

    if (isArticleFocused) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeContent, filteredEntries, isArticleFocused]);

  const updateUI = (articles, articlesUnread, responseAll, responseUnread) => {
    setEntries(articles);
    setUnreadEntries(articlesUnread);
    setTotal(responseAll.total);
    setLoadMoreVisible(articles.length < responseAll.total);
    setUnreadCount(responseUnread.total);
    setLoadMoreUnreadVisible(articlesUnread.length < responseUnread.total);
  };

  const handleResponses = (responseAll, responseUnread) => {
    if (responseAll?.entries && responseUnread?.total >= 0) {
      const articles = responseAll.entries.map(parseFirstImage);
      const articlesUnread = responseUnread.entries.map(parseFirstImage);
      updateUI(articles, articlesUnread, responseAll, responseUnread);
    }
  };

  const getArticleList = async () => {
    setLoading(true);
    let responseAll;
    let responseUnread;
    try {
      if (info.from === "history") {
        responseAll = responseUnread = await getEntries();
      } else {
        [responseAll, responseUnread] = await Promise.all([
          getEntries(),
          getEntries(0, "unread"),
        ]);
      }
      handleResponses(responseAll, responseUnread);
    } catch (error) {
      console.error("Error fetching articles: ", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshArticleList = async () => {
    if (entryListRef.current) {
      entryListRef.current.scrollTo(0, 0);
    }
    setOffset(0);
    setUnreadOffset(0);
    if (!isAppDataReady) {
      await fetchData();
      return;
    }
    await getArticleList();
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (activeContent) {
      setActiveContent(null);
    }
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isAppDataReady) {
      try {
        getArticleList();
        setIsFirstRenderCompleted(true);
        setIsArticleFocused(true);
      } catch (error) {
        Message.error("Failed to fetch articles, please try again later");
      }
    }
  }, [isAppDataReady]);

  return (
    <>
      <div className="entry-col">
        <CSSTransition
          in={!loading}
          timeout={200}
          nodeRef={cardsRef}
          classNames="fade"
        >
          <ArticleList
            cardsRef={cardsRef}
            loading={loading}
            getEntries={getEntries}
            handleEntryClick={handleEntryClick}
            ref={entryListRef}
          />
        </CSSTransition>
        <FooterPanel
          info={info}
          refreshArticleList={refreshArticleList}
          markAllAsRead={markAllAsRead}
          ref={entryListRef}
        />
      </div>
      <CSSTransition
        in={activeContent !== null}
        timeout={200}
        nodeRef={entryDetailRef}
        classNames="fade"
        unmountOnExit
      >
        <ArticleDetail
          handleEntryClick={handleEntryClick}
          entryListRef={entryListRef}
          ref={entryDetailRef}
        />
      </CSSTransition>
    </>
  );
};

export default Content;
