import React from 'react';
import { cn } from '@/lib/utils';

type Size = 'narrow' | 'wide' | 'full';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  /**
   * narrow: 移动 max-w-md → 平板 max-w-2xl → 桌面 max-w-3xl（默认，适合表单/详情）
   * wide:   移动 max-w-md → 平板 max-w-3xl → 桌面 max-w-5xl（列表/数据中心）
   * full:   全宽，移动 max-w-md → 平板 max-w-4xl → 桌面 max-w-6xl（管理后台/家庭仪表盘）
   */
  size?: Size;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}

const sizeMap: Record<Size, string> = {
  narrow: 'max-w-md md:max-w-2xl lg:max-w-3xl',
  wide: 'max-w-md md:max-w-3xl lg:max-w-5xl',
  full: 'max-w-md md:max-w-4xl lg:max-w-6xl',
};

const ResponsiveContainer = ({
  children,
  size = 'narrow',
  className,
  as: Tag = 'div',
}: ResponsiveContainerProps) => {
  return (
    <Tag className={cn('mx-auto w-full px-4', sizeMap[size], className)}>
      {children}
    </Tag>
  );
};

export default ResponsiveContainer;
