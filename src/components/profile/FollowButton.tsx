import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useFollow } from '@/hooks/useFollow';

interface FollowButtonProps {
  userId: string;
  isVerified?: boolean;
}

export const FollowButton = ({ userId, isVerified }: FollowButtonProps) => {
  const { isFollowing, loading, toggleFollow } = useFollow(userId);

  // Only show follow button for verified accounts
  if (!isVerified) return null;

  return (
    <Button
      onClick={toggleFollow}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      className="arabic-text"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="w-4 h-4 ml-2" />
      ) : (
        <UserPlus className="w-4 h-4 ml-2" />
      )}
      {isFollowing ? 'إلغاء المتابعة' : 'متابعة'}
    </Button>
  );
};