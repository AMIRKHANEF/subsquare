const { HttpError } = require("../../exc");
const postService = require("../../services/post.service");
const { ContentType, SupportChains } = require("../../constants");
const { extractPage } = require("../../utils");

async function createPost(ctx) {
  const {
    chain,
    title,
    content,
    contentType: paramContentType,
  } = ctx.request.body;

  if (!chain) {
    throw new HttpError(400, { chain: ["Chain is missing"] });
  }

  if (!SupportChains.includes(chain)) {
    throw new HttpError(400, { chain: ["Chain is not support"] })
  }

  if (!title) {
    throw new HttpError(400, { title: ["Post title is missing"] });
  }

  if (!content) {
    throw new HttpError(400, { content: ["Post content is missing"] });
  }

  if (paramContentType !== undefined && paramContentType !== ContentType.Markdown && paramContentType !== ContentType.Html) {
    throw new HttpError(400, { contentType: ["Unknown content type"] });
  }

  const contentType = paramContentType ? paramContentType : ContentType.Markdown;

  ctx.body = await postService.createPost(
    chain,
    title,
    content,
    contentType,
    ctx.user
  );
}

async function getPosts(ctx) {
  const { chain } = ctx.query;
  if (!chain) {
    throw new HttpError(400, { chain: ["Chain is missing"] });
  }

  const { page, pageSize } = extractPage(ctx);
  if (pageSize === 0 || page < 1) {
    ctx.status = 400;
    return;
  }

  ctx.body = await postService.getPostsByChain(chain, page, pageSize);
}

async function getPostById(ctx) {
  const { postId } = ctx.params;
  ctx.body = await postService.getPostById(postId);
}

async function postComment(ctx) {
  const { postId } = ctx.params;
  const {
    content,
    contentType: paramContentType,
  } = ctx.request.body;

  if (!content) {
    throw new HttpError(400, { content: [t("Comment content is missing")] });
  }

  if (paramContentType !== undefined && paramContentType !== ContentType.Markdown && paramContentType !== ContentType.Html) {
    throw new HttpError(400, { contentType: ["Unknown content type"] });
  }

  const contentType = paramContentType ? paramContentType : ContentType.Markdown;

  ctx.body = await postService.postComment(postId, content, contentType, ctx.user);
}

async function getComments(ctx) {
  const { page, pageSize } = extractPage(ctx);
  if (pageSize === 0 || page < 1) {
    ctx.status = 400;
    return;
  }


  const { postId } = ctx.params;
  ctx.body = await postService.getComments(
    postId,
    page,
    pageSize
  );
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  postComment,
  getComments,
};
