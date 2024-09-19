import React, { useEffect, useState } from 'react';
import UserHeader from '../components/UserHeader';
import UserPost from '../components/UserPost';
import { useParams } from 'react-router-dom';
import useShowToast from '../hooks/useShowToast';
import { Flex, Spinner } from '@chakra-ui/react';

const UserPage = () => {
  const [user, setUser] = useState(null);
  const { username } = useParams();
  const showToast = useShowToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch(`/api/users/profile/${username}`);
        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        // console.log("User data", data);

        setUser(data);
      } catch (error) {
        showToast("Error", error, "error");
      } finally {
        setLoading(false);
      }
    };

    getUser();

  }, [username, showToast]);

  if (!user && loading) {
    return (
      <Flex justifyContent="center">
        <Spinner size={"xl"} />
      </Flex>
    )
  }
  if (!user && !loading) return <h1>User not found</h1>;

  return (<>
    <UserHeader user={user.user} />
    <UserPost likes={1200} replies={881} postImg="/post1.png" postTitle="Let's talk about threads." />
    <UserPost likes={1500} replies={4851} postImg="/post2.jpg" postTitle="Nice catchup." />
    <UserPost likes={1520} replies={581} postImg="/post3.png" postTitle="Amazing guy." />
    <UserPost likes={1580} replies={495} postTitle="This is my first Thread." />
  </>
  );
};

export default UserPage;