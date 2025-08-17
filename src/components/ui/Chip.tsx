interface ChipProps {
  label: string;
  count: number;
  color: 'blue' | 'yellow' | 'green' | 'gray';
  size?: 'sm' | 'md';
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm'
};

export const Chip = ({ label, count, color, size = 'sm' }: ChipProps) => {
  if (count === 0) return null;
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClasses[color]} ${sizeClasses[size]}`}>
      {label} {count}
    </span>
  );
};
