import Back from "next-common/components/back";
import { withLoginUser, withLoginUserRedux } from "next-common/lib";
import { ssrNextApi as nextApi } from "next-common/services/nextApi";
import MotionDetail from "components/motion/motionDetail";
import { to404 } from "next-common/utils/serverSideUtil";
import getMetaDesc from "next-common/utils/post/getMetaDesc";
import { EmptyList } from "next-common/utils/constants";
import useUniversalComments from "components/universalComments";
import { detailPageCategory } from "next-common/utils/consts/business/category";
import DetailWithRightLayout from "next-common/components/layout/detailWithRightLayout";

export default withLoginUserRedux(({ loginUser, motion, comments, chain }) => {
  const { CommentComponent, focusEditor } = useUniversalComments({
    detail: motion,
    comments,
    loginUser,
    chain,
    type: detailPageCategory.COUNCIL_MOTION,
  });

  motion.status = motion.state?.state;

  const desc = getMetaDesc(motion);
  return (
    <DetailWithRightLayout
      user={loginUser}
      seoInfo={{ title: motion?.title, desc, ogImage: motion?.bannerUrl }}
    >
      <Back href={`/council/motions`} text="Back to Motions" />
      <MotionDetail
        motion={motion}
        user={loginUser}
        chain={chain}
        type={detailPageCategory.COUNCIL_MOTION}
        onReply={focusEditor}
      />
      {CommentComponent}
    </DetailWithRightLayout>
  );
});

export const getServerSideProps = withLoginUser(async (context) => {
  const chain = process.env.CHAIN;

  const { id, page, page_size } = context.query;
  const pageSize = Math.min(page_size ?? 50, 100);

  const { result: motion } = await nextApi.fetch(`motions/${id}`);
  if (!motion) {
    return to404(context);
  }

  const motionId = motion._id;

  const { result: comments } = await nextApi.fetch(
    `motions/${motionId}/comments`,
    {
      page: page ?? "last",
      pageSize,
    }
  );

  return {
    props: {
      motion: motion ?? null,
      comments: comments ?? EmptyList,
      chain,
    },
  };
});
