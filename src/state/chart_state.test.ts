import { GeometryValue } from '../lib/series/rendering';
import { AxisSpec, BarSeriesSpec, Position } from '../lib/series/specs';
import { getAxisId, getGroupId, getSpecId } from '../lib/utils/ids';
import { ScaleType } from '../lib/utils/scales/scales';
import { ChartStore, TooltipData } from './chart_state';
import { DataSeriesColorsValues } from '../lib/series/series';

describe('Chart Store', () => {
  const mockedRect = {
    x: 0,
    y: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 10,
    height: 12,
    toJSON: () => '',
  };
  const originalGetBBox = SVGElement.prototype.getBBox;
  beforeEach(
    () =>
      (SVGElement.prototype.getBBox = () => {
        return mockedRect;
      }),
  );
  afterEach(() => (SVGElement.prototype.getBBox = originalGetBBox));

  const store = new ChartStore();

  const SPEC_ID = getSpecId('spec_1');
  const AXIS_ID = getAxisId('axis_1');
  const GROUP_ID = getGroupId('group_1');

  const spec: BarSeriesSpec = {
    id: SPEC_ID,
    groupId: GROUP_ID,
    seriesType: 'bar',
    yScaleToDataExtent: false,
    data: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }],
    xAccessor: 'x',
    yAccessors: ['y'],
    xScaleType: ScaleType.Linear,
    yScaleType: ScaleType.Linear,
  };

  const mockFn = jest.fn();
  const elementListener = (value: GeometryValue): void => { mockFn(); };
  const outListener = (): undefined => { mockFn(); return undefined; };

  const mockLegendFn = jest.fn((ds: DataSeriesColorsValues | null) => { return; });
  const legendListener = (ds: DataSeriesColorsValues | null): void => { mockLegendFn(ds); };

  const firstLegendItem = {
    color: 'foo', label: 'bar', value: {
      specId: SPEC_ID,
      colorValues: [],
    },
  };

  const secondLegendItem = {
    color: 'baz', label: 'qux', value: {
      specId: SPEC_ID,
      colorValues: [],
    },
  };

  test('can add a single spec', () => {
    store.addSeriesSpec(spec);
    store.updateParentDimensions(600, 600, 0, 0);
    store.computeChart();
    const { seriesDomainsAndData } = store;
    expect(seriesDomainsAndData).not.toBeUndefined();
  });

  test('can add an axis', () => {
    const axisSpec: AxisSpec = {
      id: AXIS_ID,
      groupId: GROUP_ID,
      hide: false,
      showOverlappingTicks: false,
      showOverlappingLabels: false,
      position: Position.Left,
      tickSize: 30,
      tickPadding: 10,
      tickFormat: (value: any) => `value ${value}`,
    };
    store.addAxisSpec(axisSpec);
    store.computeChart();
    const { axesSpecs, axesTicksDimensions, axesPositions, axesVisibleTicks, axesTicks } = store;
    expect(axesSpecs.get(AXIS_ID)).not.toBeUndefined();
    expect(axesTicksDimensions.get(AXIS_ID)).not.toBeUndefined();
    expect(axesPositions.get(AXIS_ID)).not.toBeUndefined();
    expect(axesVisibleTicks.get(AXIS_ID)).not.toBeUndefined();
    expect(axesTicks.get(AXIS_ID)).not.toBeUndefined();
  });

  test('can toggle legend visibility', () => {
    store.toggleLegendCollapsed();
    expect(store.legendCollapsed.get()).toBe(true);

    store.toggleLegendCollapsed();
    expect(store.legendCollapsed.get()).toBe(false);
  });

  test('can respond to chart element mouseover event', () => {
    const tooltipPosition = {
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };

    const tooltipDatum = {
      x: 0,
      y: 0,
    };

    const tooltipData: TooltipData = {
      value: {
        datum: tooltipDatum,
        seriesKey: [],
        specId: SPEC_ID,
      },
      position: tooltipPosition,
    };

    const tooltipDataInvalidSpecId: TooltipData = {
      value: {
        datum: tooltipDatum,
        seriesKey: [],
        specId: getSpecId(''),
      },
      position: tooltipPosition,
    };

    store.onOverElement(tooltipDataInvalidSpecId);
    expect(store.tooltipData.get()).toEqual(null);
    expect(store.showTooltip.get()).toBe(false);

    store.setOnElementOverListener(elementListener);
    store.addSeriesSpec(spec);
    store.onOverElement(tooltipData);
    expect(store.tooltipData.get()).toEqual([['Value', 'value 0'], ['X Value', 0]]);
    expect(store.showTooltip.get()).toBe(true);
    expect(mockFn).toBeCalled();
  });

  test('can respond to chart element mouseout event', () => {
    store.showTooltip.set(true);

    store.onOutElement();
    expect(store.showTooltip.get()).toBe(false);

    store.setOnElementOutListener(outListener);

    store.onOutElement();
    expect(mockFn).toBeCalled();
  });

  test('can set tooltip position', () => {
    const position = { x: 10, y: 20 };
    store.setTooltipPosition(position.x, position.y);

    expect(store.tooltipPosition.get()).toEqual(position);
  });

  test('can set legend visibility', () => {
    store.showLegend.set(false);
    store.setShowLegend(true);

    expect(store.showLegend.get()).toEqual(true);
  });

  test('can get highlighted legend item', () => {
    store.legendItems = [firstLegendItem, secondLegendItem];

    store.highlightedLegendItemIndex.set(null);
    expect(store.highlightedLegendItem.get()).toBe(null);

    store.highlightedLegendItemIndex.set(1);
    expect(store.highlightedLegendItem.get()).toEqual(secondLegendItem);
  });

  test('can respond to legend item mouseover event', () => {
    store.legendItems = [firstLegendItem, secondLegendItem];
    store.highlightedLegendItemIndex.set(null);

    store.onLegendItemOver(0);
    expect(store.highlightedLegendItemIndex.get()).toBe(0);

    store.setOnLegendItemOverListener(legendListener);
    store.onLegendItemOver(1);
    expect(mockLegendFn).toBeCalled();
    expect(mockLegendFn.mock.calls[0][0]).toBe(secondLegendItem.value);
  });
});
