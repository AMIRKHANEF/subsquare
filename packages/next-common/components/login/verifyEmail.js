import React, { useState, useEffect } from "react";
import styled from "styled-components";

import { useDispatch } from "react-redux";
import Input from "../input";
import useCountdown from "../../utils/hooks/useCountdown";
import FlexBetween from "../styled/flexBetween";
import nextApi from "../../services/nextApi";
import { newSuccessToast } from "../../store/reducers/toastSlice";

const Label = styled.div`
  font-weight: bold;
  font-size: 12px;
`;

const Text = styled.span`
  color: #9da9bb;
`;

const SubButton = styled.button`
  all: unset;
  font-size: 12px;
  font-weight: 500;
  color: #6848ff;
  cursor: pointer;
`;

export default function VerifyEmail({ pin, setPin, email, errors, setErrors }) {
  const dispatch = useDispatch();
  const { countdown, startCountdown } = useCountdown(60);
  const [verifySent, setVerifySent] = useState(false);

  useEffect(() => {
    if (countdown === 0) {
      setVerifySent(false);
    }
  }, [countdown, verifySent]);

  const send = async () => {
    const { result, error } = await nextApi.post("user/setemail", {
      email,
      sendCode: true,
    });
    if (result) {
      setVerifySent(true);
      startCountdown();
      dispatch(
        newSuccessToast(
          "The verification code has been send to your email, Please check."
        )
      );
    } else if (error) {
      setErrors(error);
    }
  };

  return (
    <>
      <FlexBetween>
        <Label>Verify Email</Label>
        {verifySent ? (
          <Text>{countdown}</Text>
        ) : (
          <SubButton onClick={send}>Send Code</SubButton>
        )}
      </FlexBetween>
      <Input
        placeholder="Please fill PIN code"
        name="pin"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          setErrors(null);
        }}
        error={errors?.data?.token}
      />
    </>
  );
}