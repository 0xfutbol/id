import { Avatar, Button, Card, CardBody, CardFooter, CardHeader, Spinner } from "@heroui/react";
import { useEffect } from 'react';

import {
    fetchUserProfile,
    selectUser,
    selectUserError,
    selectUserLoading
} from '@/store/features/user';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function UserProfile() {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const loading = useAppSelector(selectUserLoading);
  const error = useAppSelector(selectUserError);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-danger p-4">
        <p>Error loading profile: {error}</p>
        <Button color="primary" onClick={() => dispatch(fetchUserProfile())}>
          Retry
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">
        <p>No user data available</p>
        <Button color="primary" onClick={() => dispatch(fetchUserProfile())}>
          Load Profile
        </Button>
      </div>
    );
  }

  return (
    <Card className="max-w-md">
      <CardHeader className="flex gap-4">
        <Avatar 
          src={user.avatarUrl || 'https://via.placeholder.com/150'} 
          size="lg" 
          alt={user.username}
        />
        <div className="flex flex-col">
          <p className="text-lg font-bold">{user.username}</p>
          <p className="text-small text-default-500">{user.email}</p>
        </div>
      </CardHeader>
      <CardBody>
        <p>User profile content goes here.</p>
      </CardBody>
      <CardFooter>
        <Button color="primary" size="sm">
          Edit Profile
        </Button>
      </CardFooter>
    </Card>
  );
} 