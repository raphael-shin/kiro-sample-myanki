/**
 * Component-specific TypeScript type definitions
 */

import { BaseComponentProps } from './common';

// Button component types
export interface ButtonVariants {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
}

// Input component types
export interface InputVariants {
  variant: 'default' | 'filled' | 'outlined';
  size: 'sm' | 'md' | 'lg';
}

// Card component types
export interface CardVariants {
  variant: 'default' | 'elevated' | 'outlined' | 'filled';
  padding: 'none' | 'sm' | 'md' | 'lg';
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Dropdown component types
export interface DropdownOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface DropdownProps extends BaseComponentProps {
  options: DropdownOption[];
  value?: string | number;
  placeholder?: string;
  onChange: (value: string | number) => void;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
}

// Table component types
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  rowKey?: string | ((record: T) => string);
  onRowClick?: (record: T, index: number) => void;
}

// Navigation component types
export interface NavItem {
  key: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
  disabled?: boolean;
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[];
  activeKey?: string;
  mode?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  onItemClick?: (item: NavItem) => void;
}