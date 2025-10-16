import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EvidenceBadgeProps {
  level: 'A' | 'B' | 'C' | 'D';
  className?: string;
}

const levelConfig = {
  A: {
    label: 'Strong Evidence',
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'High-quality clinical trials and systematic reviews',
  },
  B: {
    label: 'Moderate Evidence',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Some clinical evidence and observational studies',
  },
  C: {
    label: 'Limited Evidence',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Traditional use and preliminary research',
  },
  D: {
    label: 'Insufficient Evidence',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Theoretical or anecdotal evidence only',
  },
};

export function EvidenceBadge({ level, className }: EvidenceBadgeProps) {
  const config = levelConfig[level];

  return (
    <Badge
      variant="outline"
      className={cn('font-medium', config.color, className)}
      title={config.description}
    >
      {level} - {config.label}
    </Badge>
  );
}
