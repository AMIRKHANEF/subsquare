import styled from "styled-components";

import Post from "./post";
import Tip from "./tip/tip";
import Pagination from "./pagination";
import EmptyList from "./emptyList";
import Motion from "./motion/motion";

const Wrapper = styled.div`
  max-width: 848px;
  @media screen and (min-width: 1080px) {
    padding-bottom: 16px;
  }
  @media screen and (max-width: 600px) {
    margin-left: 16px;
    margin-right: 16px;
  }

  > :not(:first-child) {
    margin-top: 16px;
  }
`;

const Title = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 16px;
`;

export default function List({
  chain,
  category,
  items,
  pagination,
  create = null,
}) {
  return (
    <Wrapper>
      <Title>
        {category}
        {create && create}
      </Title>
      {items?.length > 0 ? (
        items.map((item, index) => {
          let href = `/${chain}/post/${item.postUid}`;
          if (category === "Referenda") {
            href = `/${chain}/referenda/${item.index}`;
          }
          if (category === "On-chain Motions") {
            href = `/${chain}/motion/${item.index}`;
          }
          if (category === "Tips") {
            href = `/${chain}/tip/${item.height}_${item.hash}`;
          }
          if (category === "Proposals") {
            href = `/${chain}/proposal/${item.proposalIndex}`;
          }
          return <Post key={index} data={item} chain={chain} href={href} />;
        })
      ) : (
        <EmptyList type={category} />
      )}
      {pagination && <Pagination {...pagination} />}
    </Wrapper>
  );
}
