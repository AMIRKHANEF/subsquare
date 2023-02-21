import { withLoginUser, withLoginUserRedux } from "next-common/lib";
import { ssrNextApi as nextApi } from "next-common/services/nextApi";
import { EmptyList } from "next-common/utils/constants";
import getAnnouncementBreadcrumbName from "next-common/utils/alliance/announcementBread";
import { PostProvider } from "next-common/context/post";
import DetailLayout from "next-common/components/layout/DetailLayout";
import getMetaDesc from "next-common/utils/post/getMetaDesc";
import { getBannerUrl } from "next-common/utils/banner";
import BreadcrumbWrapper from "next-common/components/detail/common/BreadcrumbWrapper";
import Breadcrumb from "next-common/components/_Breadcrumb";
import NonNullPost from "next-common/components/nonNullPost";
import useUniversalComments from "../../../components/universalComments";
import DetailItem from "../../../components/detailItem";
import AnnouncementTimeline from "next-common/components/alliance/announcement/timeline";

function AnnouncementContent({ detail, comments }) {
  const { CommentComponent, focusEditor } = useUniversalComments({
    detail,
    comments,
  });

  return (
    <>
      <DetailItem onReply={focusEditor} />
      <AnnouncementTimeline data={detail?.onchainData}/>
      {CommentComponent}
    </>
  );
}

export default withLoginUserRedux(({ id, announcement, comments }) => {
  const breadcrumbItems = [
    {
      content: "Alliance",
    },
    {
      content: "Announcements",
      path: "/alliance/announcements",
    },
    {
      content: getAnnouncementBreadcrumbName(id, announcement),
    },
  ];

  const postContent = (
    <NonNullPost>
      <AnnouncementContent detail={ announcement } comments={ comments } />
    </NonNullPost>
  );

  return <PostProvider post={announcement}>
    <DetailLayout
      seoInfo={{
        title: announcement?.title,
        desc: getMetaDesc(announcement),
        ogImage: getBannerUrl(announcement?.bannerCid),
      }}
    >
      <BreadcrumbWrapper>
        <Breadcrumb items={breadcrumbItems} />
      </BreadcrumbWrapper>
      { postContent }
    </DetailLayout>
  </PostProvider>
});

export const getServerSideProps = withLoginUser(async (context) => {
  const { id, page, page_size } = context.query;
  const { result: announcement } = await nextApi.fetch(`alliance/announcements/${ id }`);
  if (!announcement) {
    return { props: { id, announcement: null, comments: EmptyList } };
  }

  const pageSize = Math.min(page_size ?? 50, 100);
  const { result: comments } = await nextApi.fetch(
    `alliance/announcements/${ announcement._id }/comments`,
    {
      page: page ?? "last",
      pageSize,
    }
  );

  return {
    props: {
      id,
      announcement: announcement ?? null,
      comments: comments ?? EmptyList,
    },
  };
});