import { useEffect } from "react";
import { ContentWrapper } from "next-common/components/setting/styled";
import Username from "next-common/components/setting/username";
import Email from "next-common/components/setting/email";
import Password from "next-common/components/setting/password";
import Logout from "next-common/components/setting/logout";
import { useRouter } from "next/router";
import { isKeyRegisteredUser } from "next-common/utils";
import {
  SettingSection,
  TitleContainer,
} from "next-common/components/styled/containers/titleContainer";
import SettingLayout from "next-common/components/layout/settingLayout";
import { useUser } from "next-common/context/user";
import { serverSidePropsWithSummary } from "next-common/services/serverSide/serverSidePropsWithSummary";

export default function Account() {
  const loginUser = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loginUser === null) {
      router.push("/");
    }
    if (loginUser && isKeyRegisteredUser(loginUser)) {
      router.push("/settings/key-account");
    }
  }, [loginUser, router]);

  return (
    <>
      <SettingLayout>
        <SettingSection>
          <TitleContainer>Username</TitleContainer>
          <ContentWrapper>
            <Username username={loginUser?.username} />
          </ContentWrapper>
        </SettingSection>
        <SettingSection>
          <TitleContainer>Email</TitleContainer>
          <ContentWrapper>
            <Email
              email={loginUser?.email}
              verified={loginUser?.emailVerified}
            />
          </ContentWrapper>
        </SettingSection>
        <SettingSection>
          <TitleContainer>Change Password</TitleContainer>
          <ContentWrapper>
            <Password />
          </ContentWrapper>
        </SettingSection>
        <SettingSection>
          <TitleContainer>Logout</TitleContainer>
          <ContentWrapper>
            <Logout />
          </ContentWrapper>
        </SettingSection>
      </SettingLayout>
    </>
  );
}

export const getServerSideProps = serverSidePropsWithSummary;
