import { anteriorData, posteriorData } from '../data/bodyDiagramPaths';
import { getActiveMuscles, getHighlightedRbhMuscles, type RbhMuscle } from '../utils/muscleMap';

type DiagramTone = 'light' | 'dark';

interface DiagramPalette {
  accent: string;
  inactive: string;
  stroke: string;
  silhouette: string;
}

function getPalette(tone: DiagramTone): DiagramPalette {
  if (tone === 'light') {
    return {
      accent: '#c6ff00',
      inactive: '#d8d8d8',
      stroke: '#b0b0b0',
      silhouette: '#e8e8e8',
    };
  }
  return {
    accent: '#c6ff00',
    inactive: '#2e2e2e',
    stroke: '#3d3d3d',
    silhouette: '#1a1a1a',
  };
}

const SILHOUETTE_MUSCLES = new Set<RbhMuscle>(['head', 'neck', 'knees', 'calves', 'left-soleus', 'right-soleus']);

interface BodyDiagramProps {
  muscleGroups: string[];
  compact?: boolean;
  tone?: DiagramTone;
}

function muscleFill(muscle: string, highlighted: Set<RbhMuscle>, palette: DiagramPalette): string {
  if (highlighted.has(muscle as RbhMuscle)) return palette.accent;
  if (SILHOUETTE_MUSCLES.has(muscle as RbhMuscle)) return palette.silhouette;
  return palette.inactive;
}

function MusclePolygons({
  data,
  highlighted,
  palette,
  transform,
}: {
  data: typeof anteriorData;
  highlighted: Set<RbhMuscle>;
  palette: DiagramPalette;
  transform?: string;
}) {
  return (
    <g transform={transform}>
      {data.map((group) =>
        group.svgPoints.map((points, index) => {
          const active = highlighted.has(group.muscle as RbhMuscle);
          return (
            <polygon
              key={`${group.muscle}-${index}`}
              points={points}
              fill={muscleFill(group.muscle, highlighted, palette)}
              stroke={palette.stroke}
              strokeWidth={0.35}
              strokeLinejoin="round"
              className={active ? 'body-region active' : 'body-region'}
            />
          );
        })
      )}
    </g>
  );
}

const BODY_VIEW_HEIGHT = 200;
const LABEL_SPACE = 18;
const BODY_GAP = 110;

function BodyViews({
  highlighted,
  palette,
  labelSpace,
}: {
  highlighted: Set<RbhMuscle>;
  palette: DiagramPalette;
  labelSpace: number;
}) {
  return (
    <g transform={`translate(0 ${labelSpace})`}>
      <MusclePolygons data={anteriorData} highlighted={highlighted} palette={palette} />
      <MusclePolygons
        data={posteriorData}
        highlighted={highlighted}
        palette={palette}
        transform={`translate(${BODY_GAP} 0)`}
      />
    </g>
  );
}

export function BodyDiagram({ muscleGroups, compact = false, tone = 'dark' }: BodyDiagramProps) {
  const muscles = getActiveMuscles(muscleGroups);
  const highlighted = getHighlightedRbhMuscles(muscleGroups);
  const palette = getPalette(tone);
  const labelSpace = compact ? 0 : LABEL_SPACE;
  const viewHeight = BODY_VIEW_HEIGHT + labelSpace;
  const viewBox = `0 0 ${BODY_GAP + 100} ${viewHeight}`;

  return (
    <svg
      viewBox={viewBox}
      width={compact ? 72 : undefined}
      height={compact ? 44 : undefined}
      className={`body-diagram ${compact ? 'compact' : ''} body-diagram--${tone}`}
      role="img"
      aria-label={`Muscle map highlighting ${muscles.join(', ')}`}
    >
      <BodyViews highlighted={highlighted} palette={palette} labelSpace={labelSpace} />
      {!compact && (
        <>
          <text x="50" y="12" textAnchor="middle" className="body-view-label body-view-label--front">
            Front
          </text>
          <text x="160" y="12" textAnchor="middle" className="body-view-label body-view-label--back">
            Back
          </text>
        </>
      )}
    </svg>
  );
}

interface MuscleLegendProps {
  muscleGroups: string[];
}

export function MuscleLegend({ muscleGroups }: MuscleLegendProps) {
  const muscles = getActiveMuscles(muscleGroups);

  return (
    <ul className="muscle-legend">
      {muscles.map((muscle) => (
        <li key={muscle}>
          <span className="muscle-legend-swatch" style={{ background: '#c6ff00' }} />
          {muscle}
        </li>
      ))}
    </ul>
  );
}

export { getAllMuscleLabels } from '../utils/muscleMap';
