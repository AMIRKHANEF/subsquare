import { withCommonProps } from "next-common/lib";
import { ssrNextApi as nextApi } from "next-common/services/nextApi";
import { EmptyList } from "next-common/utils/constants";
import Timeline from "components/treasuryProposal/timeline";
import Metadata from "next-common/components/treasury/proposal/metadata";
import getMetaDesc from "next-common/utils/post/getMetaDesc";
import useCommentComponent from "next-common/components/useCommentComponent";
import { getBannerUrl } from "next-common/utils/banner";
import { PostProvider } from "next-common/context/post";
import CheckUnFinalized from "next-common/components/treasury/proposal/checkUnFinalized";
import NonNullPost from "next-common/components/nonNullPost";
import TreasuryProposalDetail from "next-common/components/detail/treasury/proposal";
import useSubscribePostDetail from "next-common/hooks/useSubscribePostDetail";
import DetailLayout from "next-common/components/layout/DetailLayout";
import DetailMultiTabs from "next-common/components/detail/detailMultiTabs";
import { fetchDetailComments } from "next-common/services/detail";
import { getNullDetailProps } from "next-common/services/detail/nullDetail";

function TreasuryProposalContent({ detail, comments }) {
  const { CommentComponent, focusEditor } = useCommentComponent({
    detail,
    comments,
  });

  useSubscribePostDetail(detail?.proposalIndex);

  return (
    <>
      <TreasuryProposalDetail onReply={focusEditor} />
      <DetailMultiTabs
        metadata={<Metadata treasuryProposal={detail?.onchainData} />}
        timeline={<Timeline treasuryProposal={detail?.onchainData} />}
      />
      {CommentComponent}
    </>
  );
}

export default function Proposal({ id, detail, comments }) {
  let postContent = null;

  if (detail) {
    postContent = (
      <NonNullPost>
        <TreasuryProposalContent detail={detail} comments={comments} />
      </NonNullPost>
    );
  } else {
    postContent = <CheckUnFinalized id={id} />;
  }

  const desc = getMetaDesc(detail);
  const seoInfo = {
    title: detail?.title,
    desc,
    ogImage: getBannerUrl(detail?.bannerCid),
  };

  return (
    <PostProvider post={detail}>
      <DetailLayout seoInfo={seoInfo}>{postContent}</DetailLayout>
    </PostProvider>
  );
}

export const getServerSideProps = withCommonProps(async (context) => {
  const { id } = context.query;
  const { result: detail } = await nextApi.fetch(`treasury/proposals/${id}`);

  if (!detail) {
    return getNullDetailProps(id);
  }

  const comments = await fetchDetailComments(
    `treasury/proposals/${detail._id}/comments`,
    context,
  );

  return {
    props: {
      detail,
      comments: comments ?? EmptyList,
    },
  };
});
