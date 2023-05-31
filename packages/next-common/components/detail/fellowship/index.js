import DetailContentBase from "../common/detailBase";
import PostTitle from "../common/Title";
import ArticleContent from "../../articleContent";
import React from "react";
import { usePost } from "../../../context/post";
import useSetEdit from "../common/hooks/useSetEdit";
import ReferendaPostMeta from "../common/openGov/meta";
import FellowshipWhitelistNavigation from "./whitelistNavigation";

export default function FellowshipReferendaDetail({ onReply }) {
  const post = usePost();
  const setIsEdit = useSetEdit();

  return <DetailContentBase>
    <FellowshipWhitelistNavigation />
    <PostTitle />
    <ReferendaPostMeta isFellowship />
    <ArticleContent
      post={post}
      onReply={onReply}
      setIsEdit={setIsEdit}
    />
  </DetailContentBase>;
}
