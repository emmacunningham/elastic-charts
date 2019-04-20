import {
  AnnotationDomainType,
  AnnotationDomainTypes,
  AnnotationSpec,
  AnnotationTypes,
  AxisSpec,
  Position,
  Rotation,
} from '../lib/series/specs';
import { DEFAULT_ANNOTATION_LINE_STYLE } from '../lib/themes/theme';
import { Dimensions } from '../lib/utils/dimensions';
import { AnnotationId, AxisId, getAnnotationId, getAxisId, getGroupId, GroupId } from '../lib/utils/ids';
import { createContinuousScale, createOrdinalScale, Scale, ScaleType } from '../lib/utils/scales/scales';
import {
  AnnotationLinePosition,
  AnnotationLineProps,
  computeAnnotationDimensions,
  computeAnnotationTooltipState,
  computeLineAnnotationDimensions,
  computeLineAnnotationTooltipState,
  computeRectAnnotationDimensions,
  computeRectAnnotationTooltipState,
  computeRectTooltipLeft,
  computeRectTooltipOffset,
  computeRectTooltipTop,
  DEFAULT_LINE_OVERFLOW,
  getAnnotationAxis,
  getAnnotationLineTooltipPosition,
  getAnnotationLineTooltipTransform,
  getAnnotationLineTooltipXOffset,
  getAnnotationLineTooltipYOffset,
  isBottomRectTooltip,
  isRightRectTooltip,
  isVerticalAnnotationLine,
  isWithinLineBounds,
  isWithinRectBounds,
  scaleAndValidateDatum,
  toTransformString,
} from './annotation_utils';
import { Point } from './chart_state';

describe('annotation utils', () => {
  const minRange = 0;
  const maxRange = 100;

  const continuousData = [0, 10];
  const continuousScale = createContinuousScale(ScaleType.Linear, continuousData, minRange, maxRange);

  const ordinalData = ['a', 'b', 'c', 'd', 'a', 'b', 'c'];
  const ordinalScale = createOrdinalScale(ordinalData, minRange, maxRange);

  const chartDimensions: Dimensions = {
    width: 10,
    height: 20,
    top: 5,
    left: 15,
  };

  const groupId = getGroupId('foo-group');

  const axesSpecs: Map<AxisId, AxisSpec> = new Map();
  const verticalAxisSpec: AxisSpec = {
    id: getAxisId('vertical_axis'),
    groupId,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Left,
    tickSize: 10,
    tickPadding: 10,
    tickFormat: (value: any) => value.toString(),
    showGridLines: true,
  };
  const horizontalAxisSpec: AxisSpec = {
    id: getAxisId('horizontal_axis'),
    groupId,
    hide: false,
    showOverlappingTicks: false,
    showOverlappingLabels: false,
    position: Position.Bottom,
    tickSize: 10,
    tickPadding: 10,
    tickFormat: (value: any) => value.toString(),
    showGridLines: true,
  };

  axesSpecs.set(verticalAxisSpec.id, verticalAxisSpec);

  test('should compute annotation dimensions', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotations: Map<AnnotationId, AnnotationSpec> = new Map();
    const annotationId = getAnnotationId('foo');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const rectAnnotationId = getAnnotationId('rect');
    const rectAnnotation: AnnotationSpec = {
      annotationId: rectAnnotationId,
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 'a', x2: 'b', y1: 3, y2: 5 } }],
    };

    annotations.set(annotationId, lineAnnotation);
    annotations.set(rectAnnotationId, rectAnnotation);

    const dimensions = computeAnnotationDimensions(
      annotations,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      axesSpecs,
    );
    const expectedDimensions = new Map();
    expectedDimensions.set(annotationId, [{
      position: [DEFAULT_LINE_OVERFLOW, 20, 10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [0, 20, 10, 20],
    }]);
    expectedDimensions.set(rectAnnotationId, [{ rect: { x: 0, y: 30, width: 25, height: 20 } }]);

    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should not compute annotation dimensions if a corresponding axis does not exist', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotations: Map<AnnotationId, AnnotationSpec> = new Map();
    const annotationId = getAnnotationId('foo');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    annotations.set(annotationId, lineAnnotation);

    const dimensions = computeAnnotationDimensions(
      annotations,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      new Map(), // empty axesSpecs
    );
    const expectedDimensions = new Map();
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for yDomain on a yScale (chartRotation 0, left axis)', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [{
      position: [DEFAULT_LINE_OVERFLOW, 20, 10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [0, 20, 10, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for yDomain on a yScale (chartRotation 0, right axis)', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Right,
    );
    const expectedDimensions = [{
      position: [0, 20, 10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [0, 20, 10, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for yDomain on a yScale (chartRotation 90)', () => {
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [{
      position: [20, 0, 20, 20 + DEFAULT_LINE_OVERFLOW],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [20, 0, 20, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should not compute line annotation dimensions for yDomain if no corresponding yScale', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    expect(dimensions).toEqual(null);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 0, ordinal scale)', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 'a', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [{
      position: [12.5, -DEFAULT_LINE_OVERFLOW, 12.5, 20],
      details: { detailsText: 'foo', headerText: 'a' },
      tooltipLinePosition: [12.5, 0, 12.5, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 0, continuous scale, top axis)', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Top,
    );
    const expectedDimensions = [{
      position: [20, -DEFAULT_LINE_OVERFLOW, 20, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [20, 0, 20, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 0, continuous scale, bottom axis)', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Bottom,
    );
    const expectedDimensions = [{
      position: [20, DEFAULT_LINE_OVERFLOW, 20, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [20, 0, 20, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain on a xScale (chartRotation 90, ordinal scale)', () => {
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 'a', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [{
      position: [-DEFAULT_LINE_OVERFLOW, 12.5, 10, 12.5],
      details: { detailsText: 'foo', headerText: 'a' },
      tooltipLinePosition: [0, 12.5, 10, 12.5],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain on a xScale (chartRotation 90, continuous scale)', () => {
    const chartRotation: Rotation = 90;
    const yScales: Map<GroupId, Scale> = new Map();

    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Left,
    );
    const expectedDimensions = [{
      position: [-DEFAULT_LINE_OVERFLOW, 20, 10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [0, 20, 10, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain on a xScale (chartRotation -90, continuous scale)',
    () => {
      const chartRotation: Rotation = -90;
      const yScales: Map<GroupId, Scale> = new Map();

      const xScale: Scale = continuousScale;

      const annotationId = getAnnotationId('foo-line');
      const lineAnnotation: AnnotationSpec = {
        annotationType: AnnotationTypes.Line,
        annotationId,
        domainType: AnnotationDomainTypes.XDomain,
        dataValues: [{ dataValue: 2, details: 'foo' }],
        groupId,
        style: DEFAULT_ANNOTATION_LINE_STYLE,
      };

      const dimensions = computeLineAnnotationDimensions(
        lineAnnotation,
        chartDimensions,
        chartRotation,
        yScales,
        xScale,
        Position.Left,
      );
      const expectedDimensions = [{
        position: [-DEFAULT_LINE_OVERFLOW, 0, 10, 0],
        details: { detailsText: 'foo', headerText: '2' },
        tooltipLinePosition: [0, 0, 10, 0],
      }];
      expect(dimensions).toEqual(expectedDimensions);
    });

  test('should compute line annotation dimensions for xDomain (chartRotation 180, continuous scale, top axis)', () => {
    const chartRotation: Rotation = 180;
    const yScales: Map<GroupId, Scale> = new Map();

    const xScale: Scale = continuousScale;

    const annotationId = getAnnotationId('foo-line');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const dimensions = computeLineAnnotationDimensions(
      lineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Top,
    );
    const expectedDimensions = [{
      position: [-10, -DEFAULT_LINE_OVERFLOW, -10, 20],
      details: { detailsText: 'foo', headerText: '2' },
      tooltipLinePosition: [-10, 0, -10, 20],
    }];
    expect(dimensions).toEqual(expectedDimensions);
  });

  test('should compute line annotation dimensions for xDomain (chartRotation 180, continuous scale, bottom axis)',
    () => {
      const chartRotation: Rotation = 180;
      const yScales: Map<GroupId, Scale> = new Map();
      const xScale: Scale = continuousScale;

      const annotationId = getAnnotationId('foo-line');
      const lineAnnotation: AnnotationSpec = {
        annotationType: AnnotationTypes.Line,
        annotationId,
        domainType: AnnotationDomainTypes.XDomain,
        dataValues: [{ dataValue: 2, details: 'foo' }],
        groupId,
        style: DEFAULT_ANNOTATION_LINE_STYLE,
      };

      const dimensions = computeLineAnnotationDimensions(
        lineAnnotation,
        chartDimensions,
        chartRotation,
        yScales,
        xScale,
        Position.Bottom,
      );
      const expectedDimensions = [{
        position: [-10, DEFAULT_LINE_OVERFLOW, -10, 20],
        details: { detailsText: 'foo', headerText: '2' },
        tooltipLinePosition: [-10, DEFAULT_LINE_OVERFLOW, -10, 20],
      }];
      expect(dimensions).toEqual(expectedDimensions);
    });

  test('should not compute annotation line values for values outside of domain or AnnotationSpec.hideLines', () => {
    const chartRotation: Rotation = 0;
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationId = getAnnotationId('foo-line');
    const invalidXLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 'e', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const emptyXDimensions = computeLineAnnotationDimensions(
      invalidXLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Right,
    );

    expect(emptyXDimensions).toEqual([]);

    const invalidStringXLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: '', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const invalidStringXDimensions = computeLineAnnotationDimensions(
      invalidStringXLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      continuousScale,
      Position.Right,
    );

    expect(invalidStringXDimensions).toEqual([]);

    const outOfBoundsXLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: -999, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const emptyOutOfBoundsXDimensions = computeLineAnnotationDimensions(
      outOfBoundsXLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      continuousScale,
      Position.Right,
    );

    expect(emptyOutOfBoundsXDimensions).toEqual([]);

    const invalidYLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 'e', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const emptyYDimensions = computeLineAnnotationDimensions(
      invalidYLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Right,
    );

    expect(emptyYDimensions).toEqual([]);

    const outOfBoundsYLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: -999, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const emptyOutOfBoundsYDimensions = computeLineAnnotationDimensions(
      outOfBoundsYLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      xScale,
      Position.Right,
    );

    expect(emptyOutOfBoundsYDimensions).toEqual([]);

    const invalidStringYLineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: '', details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const invalidStringYDimensions = computeLineAnnotationDimensions(
      invalidStringYLineAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      continuousScale,
      Position.Right,
    );

    expect(invalidStringYDimensions).toEqual([]);

    const validHiddenAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.XDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
      hideLines: true,
    };

    const hiddenAnnotationDimensions = computeLineAnnotationDimensions(
      validHiddenAnnotation,
      chartDimensions,
      chartRotation,
      yScales,
      continuousScale,
      Position.Right,
    );

    expect(hiddenAnnotationDimensions).toEqual(null);
  });

  test('should compute if a point is within an annotation line bounds (xDomain annotation)', () => {
    const linePosition1: AnnotationLinePosition = [10, 0, 10, 20];
    const cursorPosition1: Point = { x: 0, y: 0 };
    const cursorPosition2: Point = { x: 10, y: 0 };

    const offset: number = 0;
    const horizontalChartRotation: Rotation = 0;
    const verticalChartRotation: Rotation = 90;
    const domainType: AnnotationDomainType = AnnotationDomainTypes.XDomain;

    const horizontalRotationOutsideBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
    );

    expect(horizontalRotationOutsideBounds).toBe(false);

    const horizontalRotationWithinBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition2,
      offset,
      horizontalChartRotation,
      domainType,
    );
    expect(horizontalRotationWithinBounds).toBe(true);

    const verticalRotationOutsideBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition1,
      offset,
      verticalChartRotation,
      domainType,
    );

    expect(verticalRotationOutsideBounds).toBe(false);

    const verticalRotationWithinBounds = isWithinLineBounds(
      Position.Bottom,
      linePosition1,
      cursorPosition2,
      offset,
      verticalChartRotation,
      domainType,
    );

    expect(verticalRotationWithinBounds).toBe(true);
  });
  test('should compute if a point is within an annotation line bounds (yDomain annotation)', () => {
    const linePosition1: AnnotationLinePosition = [10, 0, 10, 20];
    const cursorPosition1: Point = { x: 0, y: 0 };
    const cursorPosition2: Point = { x: 10, y: 0 };

    const offset: number = 0;
    const horizontalChartRotation: Rotation = 0;
    const verticalChartRotation: Rotation = 90;
    const domainType: AnnotationDomainType = AnnotationDomainTypes.YDomain;

    const horizontalRotationOutsideBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition1,
      offset,
      horizontalChartRotation,
      domainType,
    );

    expect(horizontalRotationOutsideBounds).toBe(false);

    const horizontalRotationWithinBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition2,
      offset,
      horizontalChartRotation,
      domainType,
    );
    expect(horizontalRotationWithinBounds).toBe(true);

    const verticalRotationOutsideBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition1,
      offset,
      verticalChartRotation,
      domainType,
    );

    expect(verticalRotationOutsideBounds).toBe(false);

    const verticalRotationWithinBounds = isWithinLineBounds(
      Position.Left,
      linePosition1,
      cursorPosition2,
      offset,
      verticalChartRotation,
      domainType,
    );

    expect(verticalRotationWithinBounds).toBe(true);
  });
  test('should determine if an annotation line is vertical dependent on domain type & chart rotation', () => {
    const isHorizontal = true;
    const isXDomain = true;
    const xDomainHorizontalRotation = isVerticalAnnotationLine(isXDomain, isHorizontal);
    expect(xDomainHorizontalRotation).toBe(true);

    const xDomainVerticalRotation = isVerticalAnnotationLine(isXDomain, !isHorizontal);
    expect(xDomainVerticalRotation).toBe(false);

    const yDomainHorizontalRotation = isVerticalAnnotationLine(!isXDomain, isHorizontal);
    expect(yDomainHorizontalRotation).toBe(false);

    const yDomainVerticalRotation = isVerticalAnnotationLine(isXDomain, !isHorizontal);
    expect(yDomainVerticalRotation).toBe(false);
  });
  test('should get the x offset for an annotation line tooltip', () => {
    const bottomHorizontalRotationOffset = getAnnotationLineTooltipXOffset(0, Position.Bottom);
    expect(bottomHorizontalRotationOffset).toBe(50);

    const topHorizontalRotationOffset = getAnnotationLineTooltipXOffset(0, Position.Top);
    expect(topHorizontalRotationOffset).toBe(50);

    const bottomVerticalRotationOffset = getAnnotationLineTooltipXOffset(90, Position.Bottom);
    expect(bottomVerticalRotationOffset).toBe(0);

    const topVerticalRotationOffset = getAnnotationLineTooltipXOffset(90, Position.Top);
    expect(topVerticalRotationOffset).toBe(0);

    const leftHorizontalRotationOffset = getAnnotationLineTooltipXOffset(0, Position.Left);
    expect(leftHorizontalRotationOffset).toBe(0);

    const rightHorizontalRotationOffset = getAnnotationLineTooltipXOffset(0, Position.Right);
    expect(rightHorizontalRotationOffset).toBe(100);

    const leftVerticalRotationOffset = getAnnotationLineTooltipXOffset(90, Position.Left);
    expect(leftVerticalRotationOffset).toBe(50);

    const rightVerticalRotationOffset = getAnnotationLineTooltipXOffset(90, Position.Right);
    expect(rightVerticalRotationOffset).toBe(50);
  });
  test('should get the y offset for an annotation line tooltip', () => {
    const bottomHorizontalRotationOffset = getAnnotationLineTooltipYOffset(0, Position.Bottom);
    expect(bottomHorizontalRotationOffset).toBe(100);

    const topHorizontalRotationOffset = getAnnotationLineTooltipYOffset(0, Position.Top);
    expect(topHorizontalRotationOffset).toBe(0);

    const bottomVerticalRotationOffset = getAnnotationLineTooltipYOffset(90, Position.Bottom);
    expect(bottomVerticalRotationOffset).toBe(50);

    const topVerticalRotationOffset = getAnnotationLineTooltipYOffset(90, Position.Top);
    expect(topVerticalRotationOffset).toBe(50);

    const leftHorizontalRotationOffset = getAnnotationLineTooltipYOffset(0, Position.Left);
    expect(leftHorizontalRotationOffset).toBe(50);

    const rightHorizontalRotationOffset = getAnnotationLineTooltipYOffset(0, Position.Right);
    expect(rightHorizontalRotationOffset).toBe(50);

    const leftVerticalRotationOffset = getAnnotationLineTooltipYOffset(90, Position.Left);
    expect(leftVerticalRotationOffset).toBe(100);

    const rightVerticalRotationOffset = getAnnotationLineTooltipYOffset(90, Position.Right);
    expect(rightVerticalRotationOffset).toBe(100);
  });
  test('should get annotation line tooltip position', () => {
    const chartRotation: Rotation = 0;
    const linePosition: AnnotationLinePosition = [1, 2, 3, 4];

    const bottomLineTooltipPosition = getAnnotationLineTooltipPosition(
      chartRotation,
      linePosition,
      Position.Bottom,
    );
    expect(bottomLineTooltipPosition).toEqual({ xPosition: 1, yPosition: 4, xOffset: 50, yOffset: 100 });

    const topLineTooltipPosition = getAnnotationLineTooltipPosition(
      chartRotation,
      linePosition,
      Position.Top,
    );
    expect(topLineTooltipPosition).toEqual({ xPosition: 1, yPosition: 2, xOffset: 50, yOffset: 0 });

    const leftLineTooltipPosition = getAnnotationLineTooltipPosition(
      chartRotation,
      linePosition,
      Position.Left,
    );
    expect(leftLineTooltipPosition).toEqual({ xPosition: 1, yPosition: 4, xOffset: 0, yOffset: 50 });

    const rightLineTooltipPosition = getAnnotationLineTooltipPosition(
      chartRotation,
      linePosition,
      Position.Right,
    );
    expect(rightLineTooltipPosition).toEqual({ xPosition: 3, yPosition: 4, xOffset: 100, yOffset: 50 });
  });
  test('should form the string for the position transform given a TransformPoint', () => {
    const transformString = toTransformString({ xPosition: 1, yPosition: 4, xOffset: 50, yOffset: 100 });
    expect(transformString).toBe('translate(calc(1px - 50%),calc(4px - 100%))');
  });
  test('should get the transform for an annotation line tooltip', () => {
    const chartRotation: Rotation = 0;
    const linePosition: AnnotationLinePosition = [1, 2, 3, 4];

    const lineTooltipTransform = getAnnotationLineTooltipTransform(
      chartRotation,
      linePosition,
      Position.Bottom,
    );
    expect(lineTooltipTransform).toBe('translate(calc(1px - 50%),calc(4px - 100%))');
  });
  test('should compute the tooltip state for an annotation line', () => {
    const cursorPosition: Point = { x: 1, y: 2 };

    const annotationLines: AnnotationLineProps[] = [{
      position: [1, 2, 3, 4],
      details: {},
      tooltipLinePosition: [1, 2, 3, 4],
    }];
    const lineStyle = DEFAULT_ANNOTATION_LINE_STYLE;
    const chartRotation: Rotation = 0;
    const localAxesSpecs = new Map();

    // missing annotation axis (xDomain)
    const missingTooltipState = computeLineAnnotationTooltipState(
      cursorPosition,
      annotationLines,
      groupId,
      AnnotationDomainTypes.XDomain,
      lineStyle,
      chartRotation,
      localAxesSpecs,
    );

    const expectedMissingTooltipState = {
      isVisible: false,
      transform: '',
      annotationType: AnnotationTypes.Line,
    };

    expect(missingTooltipState).toEqual(expectedMissingTooltipState);

    // add axis for xDomain annotation
    localAxesSpecs.set(horizontalAxisSpec.id, horizontalAxisSpec);

    const xDomainTooltipState = computeLineAnnotationTooltipState(
      cursorPosition,
      annotationLines,
      groupId,
      AnnotationDomainTypes.XDomain,
      lineStyle,
      chartRotation,
      localAxesSpecs,
    );
    const expectedXDomainTooltipState = {
      isVisible: true,
      transform: 'translate(calc(1px - 50%),calc(4px - 100%))',
      annotationType: AnnotationTypes.Line,
    };

    expect(xDomainTooltipState).toEqual(expectedXDomainTooltipState);

    // add axis for yDomain annotation
    localAxesSpecs.set(verticalAxisSpec.id, verticalAxisSpec);

    const yDomainTooltipState = computeLineAnnotationTooltipState(
      cursorPosition,
      annotationLines,
      groupId,
      AnnotationDomainTypes.YDomain,
      lineStyle,
      chartRotation,
      localAxesSpecs,
    );
    const expectedYDomainTooltipState = {
      isVisible: true,
      transform: 'translate(calc(1px - 0%),calc(4px - 50%))',
      annotationType: AnnotationTypes.Line,
    };

    expect(yDomainTooltipState).toEqual(expectedYDomainTooltipState);
  });

  test('should compute the tooltip state for an annotation', () => {
    const annotations: Map<AnnotationId, AnnotationSpec> = new Map();
    const annotationId = getAnnotationId('foo');
    const lineAnnotation: AnnotationSpec = {
      annotationType: AnnotationTypes.Line,
      annotationId,
      domainType: AnnotationDomainTypes.YDomain,
      dataValues: [{ dataValue: 2, details: 'foo' }],
      groupId,
      style: DEFAULT_ANNOTATION_LINE_STYLE,
    };

    const cursorPosition: Point = { x: 1, y: 2 };

    const annotationLines: AnnotationLineProps[] = [{
      position: [1, 2, 3, 4],
      details: {},
      tooltipLinePosition: [1, 2, 3, 4],
    }];
    const chartRotation: Rotation = 0;
    const localAxesSpecs: Map<AxisId, AxisSpec> = new Map();

    const annotationDimensions = new Map();
    annotationDimensions.set(annotationId, annotationLines);

    // missing annotations
    const missingSpecTooltipState = computeAnnotationTooltipState(
      cursorPosition,
      annotationDimensions,
      annotations,
      chartRotation,
      localAxesSpecs,
      chartDimensions,
    );

    expect(missingSpecTooltipState).toBe(null);

    // add valid annotation axis
    annotations.set(annotationId, lineAnnotation);
    localAxesSpecs.set(verticalAxisSpec.id, verticalAxisSpec);

    // hide tooltipState
    lineAnnotation.hideTooltips = true;

    const hideTooltipState = computeAnnotationTooltipState(
      cursorPosition,
      annotationDimensions,
      annotations,
      chartRotation,
      localAxesSpecs,
      chartDimensions,
    );

    expect(hideTooltipState).toBe(null);

    // show tooltipState, hide lines
    lineAnnotation.hideTooltips = false;
    lineAnnotation.hideLines = true;

    const hideLinesTooltipState = computeAnnotationTooltipState(
      cursorPosition,
      annotationDimensions,
      annotations,
      chartRotation,
      localAxesSpecs,
      chartDimensions,
    );

    expect(hideLinesTooltipState).toBe(null);

    // show tooltipState & lines
    lineAnnotation.hideTooltips = false;
    lineAnnotation.hideLines = false;

    const tooltipState = computeAnnotationTooltipState(
      cursorPosition,
      annotationDimensions,
      annotations,
      chartRotation,
      localAxesSpecs,
      chartDimensions,
    );

    const expectedTooltipState = {
      isVisible: true,
      transform: 'translate(calc(1px - 0%),calc(4px - 50%))',
      annotationType: AnnotationTypes.Line,
    };

    expect(tooltipState).toEqual(expectedTooltipState);

    // rect annotation tooltip
    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [
        { coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } },
      ],
    };

    const rectAnnotations = new Map();
    rectAnnotations.set(annotationRectangle.annotationId, annotationRectangle);

    const rectAnnotationDimensions = [{ rect: { x: 2, y: 3, width: 3, height: 5 } }];
    annotationDimensions.set(annotationRectangle.annotationId, rectAnnotationDimensions);

    const rectTooltipState = computeAnnotationTooltipState(
      { x: 3, y: 4 },
      annotationDimensions,
      rectAnnotations,
      chartRotation,
      localAxesSpecs,
      chartDimensions,
    );

    const expectedRectTooltipState = {
      isVisible: true,
      transform: 'translate(0, 0)',
      annotationType: AnnotationTypes.Rectangle,
      top: 4,
      left: 5,
    };

    expect(rectTooltipState).toEqual(expectedRectTooltipState);
  });

  test('should get associated axis for an annotation', () => {
    const localAxesSpecs = new Map();

    const noAxis = getAnnotationAxis(
      localAxesSpecs,
      groupId,
      AnnotationDomainTypes.XDomain,
    );
    expect(noAxis).toBe(null);

    localAxesSpecs.set(horizontalAxisSpec.id, horizontalAxisSpec);
    localAxesSpecs.set(verticalAxisSpec.id, verticalAxisSpec);

    const xAnnotationAxisPosition = getAnnotationAxis(
      localAxesSpecs,
      groupId,
      AnnotationDomainTypes.XDomain,
    );
    expect(xAnnotationAxisPosition).toEqual(Position.Bottom);

    const yAnnotationAxisPosition = getAnnotationAxis(
      localAxesSpecs,
      groupId,
      AnnotationDomainTypes.YDomain,
    );
    expect(yAnnotationAxisPosition).toEqual(Position.Left);
  });
  test('should not compute rectangle annotation dimensions when no yScale', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId: getGroupId('foo'),
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } }],
    };

    const noYScale = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      0,
      yScales,
      xScale,
    );

    expect(noYScale).toBe(null);
  });
  test('should skip computing rectangle annotation dimensions when annotation data invalid', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [
        { coordinates: { x1: 1, x2: 2, y1: -10, y2: 5 } },
        { coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } },
      ],
    };

    const skippedInvalid = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      0,
      yScales,
      xScale,
    );

    expect(skippedInvalid).toEqual([{ rect: { x: 10, y: 30, width: 10, height: 20 } }]);
  });
  test('should compute rectangle annotation dimensions continuous (0 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      0,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 10, y: 30, width: 10, height: 20 } }]);
  });
  test('should compute rectangle annotation dimensions ordinal (0 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 'a', x2: 'b', y1: 0, y2: 2 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      0,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 0, y: 0, width: 25, height: 20 } }]);
  });
  test('should compute rectangle annotation dimensions continuous (180 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } }],
    };

    const rotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      180,
      yScales,
      xScale,
    );

    expect(rotated).toEqual([{ rect: { x: 0, y: 30, width: -10, height: 20 } }]);
  });
  test('should compute rectangle annotation dimensions ordinal (180 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 'a', x2: 'b', y1: 0, y2: 2 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      180,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 10, y: 0, width: -25, height: 20 } }]);
  });
  test('should compute rectangle annotation dimensions continuous (90 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      90,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 30, y: 10, width: 20, height: 10 } }]);
  });
  test('should compute rectangle annotation dimensions ordinal (90 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 'a', x2: 'b', y1: 0, y2: 2 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      90,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 0, y: 0, width: 20, height: 25 } }]);
  });
  test('should compute rectangle annotation dimensions continuous (-90 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = continuousScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 1, x2: 2, y1: 3, y2: 5 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      -90,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 30, y: 10, width: 20, height: -10 } }]);
  });
  test('should compute rectangle annotation dimensions ordinal (-90 deg rotation)', () => {
    const yScales: Map<GroupId, Scale> = new Map();
    yScales.set(groupId, continuousScale);

    const xScale: Scale = ordinalScale;

    const annotationRectangle = {
      annotationId: getAnnotationId('rect'),
      groupId,
      annotationType: AnnotationTypes.Rectangle,
      dataValues: [{ coordinates: { x1: 'a', x2: 'b', y1: 0, y2: 2 } }],
    };

    const unrotated = computeRectAnnotationDimensions(
      annotationRectangle,
      chartDimensions,
      -90,
      yScales,
      xScale,
    );

    expect(unrotated).toEqual([{ rect: { x: 0, y: 20, width: 20, height: -25 } }]);
  });
  test('should validate scaled dataValues', () => {
    expect(scaleAndValidateDatum('', ordinalScale)).toBe(null);
    expect(scaleAndValidateDatum('a', continuousScale)).toBe(null);
    expect(scaleAndValidateDatum(-10, continuousScale)).toBe(null);
    expect(scaleAndValidateDatum(20, continuousScale)).toBe(null);
  });
  test('should determine if a point is within a rectangle annotation', () => {
    const cursorPosition = { x: 3, y: 4 };

    const outOfXBounds = { startX: 4, endX: 5, startY: 3, endY: 5 };
    const outOfYBounds = { startX: 2, endX: 4, startY: 5, endY: 6 };
    const withinBounds = { startX: 2, endX: 4, startY: 3, endY: 5 };
    const withinBoundsReverseXScale = { startX: 4, endX: 2, startY: 3, endY: 5 };
    const withinBoundsReverseYScale = { startX: 2, endX: 4, startY: 5, endY: 3 };

    // chart rotation 0
    expect(isWithinRectBounds(0, cursorPosition, outOfXBounds)).toBe(false);
    expect(isWithinRectBounds(0, cursorPosition, outOfYBounds)).toBe(false);
    expect(isWithinRectBounds(0, cursorPosition, withinBounds)).toBe(true);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseXScale)).toBe(false);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseYScale)).toBe(false);

    // chart rotation 180
    expect(isWithinRectBounds(180, cursorPosition, outOfXBounds)).toBe(false);
    expect(isWithinRectBounds(180, cursorPosition, outOfYBounds)).toBe(false);
    expect(isWithinRectBounds(180, cursorPosition, withinBounds)).toBe(false);
    expect(isWithinRectBounds(180, cursorPosition, withinBoundsReverseXScale)).toBe(true);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseYScale)).toBe(false);

    // chart rotation 90
    expect(isWithinRectBounds(90, cursorPosition, outOfXBounds)).toBe(false);
    expect(isWithinRectBounds(90, cursorPosition, outOfYBounds)).toBe(false);
    expect(isWithinRectBounds(90, cursorPosition, withinBounds)).toBe(true);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseXScale)).toBe(false);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseYScale)).toBe(false);

    // chart rotation -90
    expect(isWithinRectBounds(-90, cursorPosition, outOfXBounds)).toBe(false);
    expect(isWithinRectBounds(-90, cursorPosition, outOfYBounds)).toBe(false);
    expect(isWithinRectBounds(-90, cursorPosition, withinBounds)).toBe(false);
    expect(isWithinRectBounds(0, cursorPosition, withinBoundsReverseXScale)).toBe(false);
    expect(isWithinRectBounds(-90, cursorPosition, withinBoundsReverseYScale)).toBe(true);
  });
  test('should determine if an annotation has a rightward tooltip based on cursor position', () => {
    // chart rotation 0
    expect(isRightRectTooltip(0, 0, 10)).toBe(true);
    expect(isRightRectTooltip(0, 8, 10)).toBe(false);

    // chart rotation 180
    expect(isRightRectTooltip(180, 0, 10)).toBe(false);
    expect(isRightRectTooltip(180, 8, 10)).toBe(true);

    // chart rotation 90
    expect(isRightRectTooltip(90, 0, 10)).toBe(true);
    expect(isRightRectTooltip(90, 8, 10)).toBe(false);

    // chart rotation -90
    expect(isRightRectTooltip(-90, 0, 10)).toBe(true);
    expect(isRightRectTooltip(-90, 8, 10)).toBe(false);
  });
  test('should determine if an annotation has a bottomward tooltip based on cursor position', () => {
    // chart rotation 0
    expect(isBottomRectTooltip(0, 0, 10)).toBe(true);
    expect(isBottomRectTooltip(0, 8, 10)).toBe(false);

    // chart rotation 180
    expect(isBottomRectTooltip(180, 0, 10)).toBe(true);
    expect(isBottomRectTooltip(180, 8, 10)).toBe(false);

    // chart rotation 90
    expect(isBottomRectTooltip(90, 0, 10)).toBe(true);
    expect(isBottomRectTooltip(90, 8, 10)).toBe(false);

    // chart rotation -90
    expect(isBottomRectTooltip(-90, 0, 10)).toBe(false);
    expect(isBottomRectTooltip(-90, 8, 10)).toBe(true);
  });
  test('should compute rect annotation tooltip left', () => {
    const isHorizontalChartRotation = true;
    const isRightTooltip = true;
    const xPosition = { startX: 2, endX: 4 };
    const cursorX = 3;

    expect(computeRectTooltipLeft(isHorizontalChartRotation, isRightTooltip, xPosition, cursorX)).toBe(4);
    expect(computeRectTooltipLeft(isHorizontalChartRotation, !isRightTooltip, xPosition, cursorX)).toBe(2);
    expect(computeRectTooltipLeft(!isHorizontalChartRotation, isRightTooltip, xPosition, cursorX)).toBe(3);
  });
  test('should compute rect annotation tooltip top', () => {
    const isHorizontalChartRotation = true;
    const isBottomTooltip = true;
    const yPosition = { startY: 2, endY: 4 };
    const cursorY = 3;

    expect(computeRectTooltipTop(isHorizontalChartRotation, isBottomTooltip, yPosition, cursorY)).toBe(3);
    expect(computeRectTooltipTop(!isHorizontalChartRotation, isBottomTooltip, yPosition, cursorY)).toBe(4);
    expect(computeRectTooltipTop(!isHorizontalChartRotation, !isBottomTooltip, yPosition, cursorY)).toBe(2);
  });
  test('should compute rect annotation tooltip offset', () => {
    const isRightTooltip = true;
    const isBottomTooltip = true;

    // chart rotation 0
    expect(computeRectTooltipOffset(isRightTooltip, isBottomTooltip, 0))
      .toEqual({ offsetLeft: '0', offsetTop: '0' });
    expect(computeRectTooltipOffset(!isRightTooltip, isBottomTooltip, 0))
      .toEqual({ offsetLeft: '-100%', offsetTop: '0' });
    expect(computeRectTooltipOffset(isRightTooltip, !isBottomTooltip, 0))
      .toEqual({ offsetLeft: '0', offsetTop: '-100%' });
    expect(computeRectTooltipOffset(!isRightTooltip, !isBottomTooltip, 0))
      .toEqual({ offsetLeft: '-100%', offsetTop: '-100%' });

    // chart rotation 180
    expect(computeRectTooltipOffset(isRightTooltip, isBottomTooltip, 180))
      .toEqual({ offsetLeft: '-100%', offsetTop: '0' });
    expect(computeRectTooltipOffset(!isRightTooltip, isBottomTooltip, 180))
      .toEqual({ offsetLeft: '0', offsetTop: '0' });
    expect(computeRectTooltipOffset(isRightTooltip, !isBottomTooltip, 180))
      .toEqual({ offsetLeft: '-100%', offsetTop: '-100%' });
    expect(computeRectTooltipOffset(!isRightTooltip, !isBottomTooltip, 180))
      .toEqual({ offsetLeft: '0', offsetTop: '-100%' });

    // chart rotation 90
    expect(computeRectTooltipOffset(isRightTooltip, isBottomTooltip, 90))
      .toEqual({ offsetLeft: '0', offsetTop: '0' });
    expect(computeRectTooltipOffset(!isRightTooltip, isBottomTooltip, 90))
      .toEqual({ offsetLeft: '-100%', offsetTop: '0' });
    expect(computeRectTooltipOffset(isRightTooltip, !isBottomTooltip, 90))
      .toEqual({ offsetLeft: '0', offsetTop: '-100%' });
    expect(computeRectTooltipOffset(!isRightTooltip, !isBottomTooltip, 90))
      .toEqual({ offsetLeft: '-100%', offsetTop: '-100%' });

    // chart rotation -90
    expect(computeRectTooltipOffset(isRightTooltip, isBottomTooltip, -90))
      .toEqual({ offsetLeft: '0', offsetTop: '-100%' });
    expect(computeRectTooltipOffset(!isRightTooltip, isBottomTooltip, -90))
      .toEqual({ offsetLeft: '-100%', offsetTop: '-100%' });
    expect(computeRectTooltipOffset(isRightTooltip, !isBottomTooltip, -90))
      .toEqual({ offsetLeft: '0', offsetTop: '0' });
    expect(computeRectTooltipOffset(!isRightTooltip, !isBottomTooltip, -90))
      .toEqual({ offsetLeft: '-100%', offsetTop: '0' });
  });
  test('should compute tooltip state for rect annotation', () => {
    const cursorPosition = { x: 3, y: 4 };
    const annotationRects = [{ rect: { x: 2, y: 3, width: 3, height: 5 } }];

    const visibleTooltip = computeRectAnnotationTooltipState(cursorPosition, annotationRects, 0, chartDimensions);
    const expectedVisibleTooltipState = {
      isVisible: true,
      transform: 'translate(0, 0)',
      annotationType: 'rectangle',
      top: 4,
      left: 5,
    };

    expect(visibleTooltip).toEqual(expectedVisibleTooltipState);
  });
});
