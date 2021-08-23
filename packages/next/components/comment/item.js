import styled, { css } from "styled-components";

import Author from "components/author";
import { timeDuration } from "utils";
import Markdown from "components/markdown";
import Edit from "./edit";
import HtmlRender from "../post/htmlRender";
import nextApi from "services/nextApi";
import { useState } from "react";
import ReplyIcon from "public/imgs/icons/reply.svg"
import ThumbUpIcon from "public/imgs/icons/thumb-up.svg"
import Input from "./input";
import { useDispatch } from "react-redux";
import { addToast } from "store/reducers/toastSlice";
import User from "components/user";
import EditInput from "./editInput";

const Wrapper = styled.div`
  padding: 16px 0;

  :not(:last-child) {
    border-bottom: 1px solid #ebeef4;
  }

  :hover {
    .edit {
      display: block;
    }
  }
`;

const InfoWrapper = styled.div`
  display: flex;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;

  > :last-child {
    color: #9da9bb;
  }
`;

const ContentWrapper = styled.div`
  margin: 8px 0 0 28px;
`;

const ActionWrapper = styled.div`
  display: flex;
  margin: 16px 0 0 28px;
  align-items: flex-start;
  height: 22px;
`;

const ActionItem = styled.div`
  cursor: default;

  ${p => !p.noHover && css`
    cursor: pointer;
    :hover {
      color: #506176;
      > svg {
        path {
          fill: #506176;
        }
      }
    }
  `}

  ${p => p.highlight ? css`
    color: #506176;
    > svg {
      path {
        fill: #506176;
      }
    }
  ` : css`
    color: #9da9bb;
    > svg {
      path {
        fill: #9da9bb;
      }
    }
  `}

  display: flex;
  align-items: center;
  font-style: normal;
  font-weight: normal;
  font-size: 14px;
  line-height: 100%;

  :not(:first-child) {
    margin-left: 17px;
  }

  > svg {
    margin-right: 8px;
  }
`;


const SupporterWrapper = styled.div`
  display: flex;
  flex-flow: wrap;
  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 22px;
  padding: 8px 12px;
  background: #F6F7FA;
  border-radius: 4px;
  margin: 16px 0 0 28px;
`;

const SupporterTitle = styled.div`
  color: #9DA9BB;
  margin-right: 16px;
`;

const SupporterItem = styled.div`
  display: inline-block;
  color: #506176;
  margin-right: 12px;
`;

export default function Item({ user, data, chain, onReply }) {
  const dispatch = useDispatch();
  const [comment, setComment] = useState(data);
  const [thumbUpLoading, setThumbUpLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const commentId = comment._id;
  const isLoggedIn = !!user;
  const ownComment = isLoggedIn && comment.author?.username === user.username;
  const thumbUp = isLoggedIn && comment?.reactions?.findIndex(r => r.user?.username === user.username) > -1;

  const updateComment = async () => {
    const { result: updatedComment } = await nextApi.fetch(`comments/${comment._id}`);
    if (updatedComment) {
      setComment(updatedComment);
    }
  };

  const toggleThumbUp = async () => {
    if (isLoggedIn && !ownComment && !thumbUpLoading) {
      setThumbUpLoading(true);
      try {
        let result, error;

        if (thumbUp) {
          (
            { result, error } = await nextApi.fetch(`comments/${comment._id}/reaction`, {}, {
              method: "DELETE",
            })
          );
        } else {
          (
            { result, error } = await nextApi.fetch(`comments/${comment._id}/reaction`, {}, {
              method: "PUT",
              body: JSON.stringify({ reaction: 1 }),
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        if (result) {
          await updateComment();
        }
        if (error) {
          dispatch(addToast({
            type: "error",
            message: error.message,
          }));
        }
      } finally {
        setThumbUpLoading(false);
      }
    }
  };

  return (
    <Wrapper>
      <InfoWrapper>
        <Author
          username={comment.author?.username}
          emailMd5={comment.author?.emailMd5}
          address={comment.author?.addresses?.[0]?.address}
        />
        <div>{timeDuration(comment.createdAt)}</div>
      </InfoWrapper>
      {!isEdit && (
        <>
          <ContentWrapper>
            {comment.contentType === "markdown" && <Markdown md={comment.content} />}
            {comment.contentType === "html" && <HtmlRender html={comment.content} />}
          </ContentWrapper>
          <ActionWrapper>
            <ActionItem
              onClick={() => {
                if (isLoggedIn && !ownComment) {
                  onReply(comment.author?.username);
                }
              }}
              noHover={!isLoggedIn || ownComment}
            >
              <ReplyIcon />
              <div>Reply</div>
            </ActionItem>
            <ActionItem
              noHover={!isLoggedIn || ownComment}
              highlight={isLoggedIn && thumbUp}
              onClick={toggleThumbUp}
            >
              <ThumbUpIcon />
              <div>Up ({comment?.reactions?.length ?? 0})</div>
            </ActionItem>
            <Edit
              edit={user && user.username === comment.author?.username}
              setIsEdit={setIsEdit}
            />
          </ActionWrapper>
          {
            comment?.reactions?.length > 0 && (
              <SupporterWrapper>
                <SupporterTitle>Supported By</SupporterTitle>
                { comment.reactions.filter(r => r.user).map((r, index) => (
                  <SupporterItem key={index}>
                    <User user={r.user} chain={chain} />
                  </SupporterItem>
                )) }
              </SupporterWrapper>
            )
          }
        </>
      )}
      {isEdit && (
        <EditInput
          editContent={comment.content}
          editContentType={comment.contentType}
          onFinishedEdit={(reload) => {
            if (reload) {
              updateComment();
            }
            setIsEdit(false);
          }}
          commentId={commentId}
        />
      )}
    </Wrapper>
  );
}
