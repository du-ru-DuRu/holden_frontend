import React, { useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import Header from '../../components/Header';
import { requestForToken } from '../../firebase'; // Import Firebase FCM token function

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 80vh;
`;

const Title = styled.div`
  margin-top: 20px;
`;

const LoginRedirectHandler = () => {
  useEffect(() => {
    const code = new URL(document.location.toString()).searchParams.get('code');
    console.log(code);

    if (code) {
      axios
        .get(`${process.env.REACT_APP_BASE_URL}/user/kakao/token?code=${code}`)
        .then((response) => {
          console.log('Login success:', response.data.result);
          localStorage.setItem('accessToken', response.data.result.accessToken);
          localStorage.setItem('name', response.data.result.member.nickname);
          localStorage.setItem(
            'profileImage',
            response.data.result.member.profileImage
          );

          // Request Firebase FCM token
          requestForToken().then((token) => {
            // Send token and other data to server
            axios.post(`${process.env.REACT_APP_BASE_URL}/user/firebase/token`, {
              userId: response.data.result.userId, // Adjust according to your response structure
              token,
            }, {
              headers: { // Note the corrected placement and syntax here
                Authorization: `${localStorage.getItem('accessToken')}`,
              },
            }).then((response) => {
              console.log('Firebase token sent:', response.data);
            }).catch((error) => {
              console.error('Error sending Firebase token:', error);
            });
          });

          //window.location.href = '/';
        })
        .catch((error) => {
          console.error('Login failed:', error);
        });
    }
  }, []);

  return (
    <>
      <Header />
      <Container>
        <Title>로그인 처리 중</Title>
      </Container>
    </>
  );
};

export default LoginRedirectHandler;
