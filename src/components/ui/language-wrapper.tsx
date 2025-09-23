import React from "react";
import { cn } from "@/lib/utils";

interface LanguageWrapperProps {
  language?: "ar" | "en";
  textDirection?: "rtl" | "ltr";
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

export const LanguageWrapper: React.FC<LanguageWrapperProps> = ({
  language = "ar",
  textDirection,
  children,
  className,
  as: Component = "div"
}) => {
  // استنتاج اتجاه النص من اللغة إذا لم يُحدد
  const direction = textDirection || (language === "ar" ? "rtl" : "ltr");
  
  // تحديد الكلاسات المناسبة
  const langClass = `lang-${language}`;
  const contentClass = `content-${language}`;
  
  return (
    <Component
      className={cn(langClass, className)}
      dir={direction}
    >
      <div className={cn(contentClass)}>
        {children}
      </div>
    </Component>
  );
};

// مكون مساعد للنصوص
interface TextWrapperProps {
  language?: "ar" | "en";
  textDirection?: "rtl" | "ltr";
  children: React.ReactNode;
  className?: string;
}

export const TextWrapper: React.FC<TextWrapperProps> = ({
  language = "ar",
  textDirection,
  children,
  className
}) => {
  const direction = textDirection || (language === "ar" ? "rtl" : "ltr");
  const langClass = `lang-${language}`;
  
  return (
    <span
      className={cn(langClass, className)}
      dir={direction}
    >
      {children}
    </span>
  );
};