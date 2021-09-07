import styled from "styled-components";

import Back from "components/back";
import { withLoginUser, withLoginUserRedux } from "lib";
import nextApi from "services/nextApi";
import LayoutFixedHeader from "../../../components/layoutFixedHeader";
import MotionDetail from "../../../components/motion/motionDetail";

const Wrapper = styled.div`
  > :not(:first-child) {
    margin-top: 16px;
  }

  max-width: 848px;
  margin: auto;
`;


export default withLoginUserRedux(({loginUser, detail, chain}) => {

  return (
    <LayoutFixedHeader user={loginUser} chain={chain}>
      <Wrapper className="post-content">
        <Back href={`/${chain}/motions`} text="Back to Motions"/>
        <MotionDetail
          data={detail}
          user={loginUser}
          chain={chain}
          type="motion"
        />
      </Wrapper>
    </LayoutFixedHeader>
  );
});

export const getServerSideProps = withLoginUser(async (context) => {
  const {chain, id } = context.query;

  const [{result: detail}] = await Promise.all([
    nextApi.fetch(`${chain}/motions/${id}`),
  ]);

  return {
    props: {
      detail: detail ?? null,
      chain,
    },
  };
});
