import Web3Address from "next-common/components/setting/web3Address";
import Logout from "next-common/components/setting/logout";
import { useRouter } from "next/router";
import { isKeyRegisteredUser } from "next-common/utils";
import { useEffect } from "react";
import SettingLayout from "next-common/components/layout/settingLayout";
import {
  SettingSection,
  TitleContainer,
} from "next-common/components/styled/containers/titleContainer";
import { ContentWrapper } from "next-common/components/setting/styled";
import { getServerSidePropsWithTracks } from "next-common/services/serverSide";
import { useUser } from "next-common/context/user";

export default function KeyAccountSettingPage() {
  const loginUser = useUser();
  const address = loginUser?.address || "";

  const router = useRouter();

  useEffect(() => {
    if (loginUser === null) {
      router.push("/");
    }
    if (loginUser && !isKeyRegisteredUser(loginUser)) {
      router.push("/settings/account");
    }
  }, [loginUser, router]);

  return (
    <SettingLayout>
      <SettingSection>
        <TitleContainer>Web3 Address</TitleContainer>
        <ContentWrapper>
          <Web3Address address={address} />
        </ContentWrapper>
      </SettingSection>
      <SettingSection>
        <TitleContainer>Logout</TitleContainer>
        <ContentWrapper>
          <Logout />
        </ContentWrapper>
      </SettingSection>
    </SettingLayout>
  );
}

export const getServerSideProps = getServerSidePropsWithTracks;