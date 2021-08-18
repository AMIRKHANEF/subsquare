import styled from "styled-components";

import Grvatar from "components/gravatar";
import Avatar from "components/avatar";

const Wrapper = styled.div`
  display: flex;
  align-items: center;

  > img {
    height: 20px;
    width: 20px;
    margin-right: 8px;
  }
`;

export default function Author({ username, address, emailMd5 }) {
  return (
    <Wrapper>
      {address ? (
        <Avatar address={address} size={20} />
      ) : (
        <Grvatar emailMd5={emailMd5} size={20} />
      )}
      <div>{username}</div>
    </Wrapper>
  );
}
