import React from 'react';
import { Group, Line } from 'react-konva';
import { LineAnnotationStyle } from '../../lib/themes/theme';
import { Dimensions } from '../../lib/utils/dimensions';
import { AnnotationLineProps } from '../../state/annotation_utils';

interface AnnotationProps {
  chartDimensions: Dimensions;
  debug: boolean;
  lines: AnnotationLineProps[];
  lineStyle: LineAnnotationStyle;
}

export class Annotation extends React.PureComponent<AnnotationProps> {
  render() {
    return this.renderAnnotation();
  }
  private renderAnnotationLine = (lineConfig: AnnotationLineProps, i: number) => {
    const { line } = this.props.lineStyle;
    const { position } = lineConfig;

    const lineProps = {
      points: position,
      ...line,
    };

    return <Line key={`tick-${i}`} {...lineProps} />;
  }

  private renderAnnotation = () => {
    const { chartDimensions, lines } = this.props;

    return (
      <Group x={chartDimensions.left} y={chartDimensions.top}>
        {lines.map(this.renderAnnotationLine)}
      </Group>
    );
  }
}
