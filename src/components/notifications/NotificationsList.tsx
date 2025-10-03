import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationsList = () => {
  const { notifications, isLoading, markAsRead, markAllAsRead, unreadCount } =
    useNotifications();

  if (isLoading) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        جاري التحميل...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        لا توجد إشعارات
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">الإشعارات</h3>
        {typeof unreadCount === "number" && unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead()}
            className="text-xs"
          >
            <CheckCheck className="h-4 w-4 ml-1" />
            تحديد الكل كمقروء
          </Button>
        )}
      </div>
      <ScrollArea className="h-[400px]">
        {notifications.map((notification) => (
          <div key={notification.id}>
            <button
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              className={cn(
                "w-full text-right p-4 hover:bg-accent/50 transition-colors",
                !notification.is_read && "bg-accent/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                    !notification.is_read ? "bg-primary" : "bg-transparent"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{notification.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: ar,
                    })}
                  </p>
                </div>
              </div>
            </button>
            <Separator />
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
