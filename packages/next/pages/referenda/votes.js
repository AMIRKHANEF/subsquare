import { withLoginUser, withLoginUserRedux } from "next-common/lib";
import { ssrNextApi } from "next-common/services/nextApi";
import {
  fellowshipTracksApi,
  gov2ReferendumsSummaryApi,
  gov2TracksApi,
} from "next-common/services/url";
import ReferendaLayout from "next-common/components/layout/referendaLayout";
import {
  ModuleTabProvider,
  Referenda,
} from "next-common/components/profile/votingHistory/common";
import ModuleVotes from "components/myvotes/moduleVotes";
import { useUser } from "next-common/context/user";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default withLoginUserRedux(({ summary }) => {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user?.address) {
      router.push("/referenda");
    }
  }, [user, router]);

  const title = "OpenGov Referenda";

  const seoInfo = { title, desc: title };

  return (
    <ReferendaLayout seoInfo={seoInfo} title={title} summaryData={summary}>
      <ModuleTabProvider defaultTab={Referenda}>
        <ModuleVotes />
      </ModuleTabProvider>
    </ReferendaLayout>
  );
});

export const getServerSideProps = withLoginUser(async (context) => {
  const [
    { result: tracks },
    { result: fellowshipTracks },
    { result: summary },
  ] = await Promise.all([
    ssrNextApi.fetch(gov2TracksApi),
    ssrNextApi.fetch(fellowshipTracksApi),
    ssrNextApi.fetch(gov2ReferendumsSummaryApi),
  ]);

  return {
    props: {
      tracks: tracks ?? [],
      fellowshipTracks: fellowshipTracks ?? [],
      summary: summary ?? {},
    },
  };
});