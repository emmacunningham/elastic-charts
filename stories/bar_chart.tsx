import { boolean } from '@storybook/addon-knobs';
import { storiesOf } from '@storybook/react';
import React from 'react';
import {
  Axis,
  BarSeries,
  Chart,
  DARK_THEME,
  DataGenerator,
  getAxisId,
  getSpecId,
  LIGHT_THEME,
  niceTimeFormatByDay,
  Position,
  ScaleType,
  Settings,
  timeFormatter,
} from '../src/';
import * as TestDatasets from '../src/lib/series/utils/test_dataset';
import { KIBANA_METRICS } from '../src/lib/series/utils/test_dataset_kibana';

storiesOf('Bar Chart', module)
  .add('basic', () => {
    const darkmode = boolean('darkmode', false);
    const className = darkmode ? 'story-chart-dark' : 'story-chart';
    return (
      <Chart renderer="canvas" className={className}>
        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with axis', () => {
    const darkmode = boolean('darkmode', false);
    const className = darkmode ? 'story-chart-dark' : 'story-chart';
    const defaultTheme = darkmode ? DARK_THEME : LIGHT_THEME;
    return (
      <Chart renderer="canvas" className={className}>
        <Settings theme={defaultTheme} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with ordinal x axis', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 'a', y: 2 }, { x: 'b', y: 7 }, { x: 'c', y: 3 }, { x: 'd', y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with linear x axis', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 1, y: 2 }, { x: 2, y: 7 }, { x: 4, y: 3 }, { x: 9, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with time x axis', () => {
    const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={boolean('showOverlappingTicks bottom axis', false)}
          showOverlappingLabels={boolean('showOverlappingLabels bottom axis', false)}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with log y axis', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Log}
          xAccessor="x"
          yAccessors={['y']}
          data={[
            { x: 1, y: 0 },
            { x: 2, y: 1 },
            { x: 3, y: 2 },
            { x: 4, y: 3 },
            { x: 5, y: 4 },
            { x: 6, y: 5 },
            { x: 7, y: 6 },
            { x: 8, y: 7 },
          ]}
          yScaleToDataExtent={true}
        />
      </Chart>
    );
  })
  .add('with stacked log y axis', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Log}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          stackAccessors={['x']}
          data={[
            { x: 1, y: 0, g: 'a' },
            { x: 1, y: 0, g: 'b' },
            { x: 2, y: 1, g: 'a' },
            { x: 2, y: 1, g: 'b' },
            { x: 3, y: 2, g: 'a' },
            { x: 3, y: 2, g: 'b' },
            { x: 4, y: 3, g: 'a' },
            { x: 4, y: 0, g: 'b' },
            { x: 5, y: 4, g: 'a' },
            { x: 5, y: 0.5, g: 'b' },
            { x: 6, y: 5, g: 'a' },
            { x: 6, y: 1, g: 'b' },
            { x: 7, y: 6, g: 'b' },
            { x: 8, y: 7, g: 'a' },
            { x: 8, y: 10, g: 'b' },
            { x: 9, y: 4, g: 'a' },
          ]}
          yScaleToDataExtent={true}
        />
      </Chart>
    );
  })
  .add('with axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('stacked with axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          stackAccessors={['x']}
          splitSeriesAccessors={['g']}
          data={[
            { x: 0, y: 2, g: 'a' },
            { x: 1, y: 7, g: 'a' },
            { x: 2, y: 3, g: 'a' },
            { x: 3, y: 6, g: 'a' },
            { x: 0, y: 4, g: 'b' },
            { x: 1, y: 5, g: 'b' },
            { x: 2, y: 8, g: 'b' },
            { x: 3, y: 2, g: 'b' },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('clustered with axis and legend', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={[
            { x: 0, y: 2, g: 'a' },
            { x: 1, y: 7, g: 'a' },
            { x: 2, y: 3, g: 'a' },
            { x: 3, y: 6, g: 'a' },
            { x: 0, y: 4, g: 'b' },
            { x: 1, y: 5, g: 'b' },
            { x: 2, y: 8, g: 'b' },
            { x: 3, y: 2, g: 'b' },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('clustered multiple series specs', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'elements'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'count'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bar series 1')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 2 }, { x: 1, y: 7 }, { x: 2, y: 3 }, { x: 3, y: 6 }]}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId('bar series 2')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 0, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 4 }]}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId('bar series 3')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={[
            { x: 0, y: 1, g: 'a' },
            { x: 1, y: 2, g: 'a' },
            { x: 2, y: 3, g: 'a' },
            { x: 3, y: 4, g: 'a' },
            { x: 0, y: 5, g: 'b' },
            { x: 1, y: 8, g: 'b' },
            { x: 2, y: 9, g: 'b' },
            { x: 3, y: 2, g: 'b' },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('time clustered using various specs', () => {
    const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={boolean('showOverlappingTicks bottom axis', false)}
          showOverlappingLabels={boolean('showOverlappingLabels bottom axis', false)}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[1].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[1].data}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[2].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          data={KIBANA_METRICS.metrics.kibana_os_load[2].data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('time stacked using various specs', () => {
    const dateFormatter = timeFormatter(niceTimeFormatByDay(1));
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings debug={boolean('debug', false)} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={boolean('showOverlappingTicks bottom axis', false)}
          showOverlappingLabels={boolean('showOverlappingLabels bottom axis', false)}
          tickFormat={dateFormatter}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[2].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          stackAccessors={[0]}
          data={KIBANA_METRICS.metrics.kibana_os_load[2].data.slice(0, 20)}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[1].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          stackAccessors={[0]}
          data={KIBANA_METRICS.metrics.kibana_os_load[1].data.slice(0, 20)}
          yScaleToDataExtent={false}
        />
        <BarSeries
          id={getSpecId(KIBANA_METRICS.metrics.kibana_os_load[0].metric.label)}
          xScaleType={ScaleType.Time}
          yScaleType={ScaleType.Linear}
          xAccessor={0}
          yAccessors={[1]}
          stackAccessors={[0]}
          data={KIBANA_METRICS.metrics.kibana_os_load[0].data.slice(0, 20)}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('1y0g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={TestDatasets.BARCHART_1Y0G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('1y1g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={TestDatasets.BARCHART_1Y1G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('1y2g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g1', 'g2']}
          data={TestDatasets.BARCHART_1Y2G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('2y0g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y1', 'y2']}
          data={TestDatasets.BARCHART_2Y0G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('2y1g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y1', 'y2']}
          splitSeriesAccessors={['g']}
          data={TestDatasets.BARCHART_2Y1G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('2y2g', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Settings showLegend={true} legendPosition={Position.Right} />
        <Axis
          id={getAxisId('bottom')}
          position={Position.Bottom}
          title={'Bottom axis'}
          showOverlappingTicks={true}
        />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars1')}
          xScaleType={ScaleType.Ordinal}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y1', 'y2']}
          splitSeriesAccessors={['g1', 'g2']}
          data={TestDatasets.BARCHART_2Y2G}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('with high data volume', () => {
    const dg = new DataGenerator();
    const data = dg.generateSimpleSeries(200);
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={data}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('single data chart', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          data={[{ x: 1, y: 10 }]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('single data clusterd chart', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          data={[
            { x: 1, y: 10, g: 'a' },
            { x: 1, y: 5, g: 'b' },
            { x: 1, y: 3, g: 'c' },
            { x: 1, y: 10, g: 'd' },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('single data stacked chart', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          stackAccessors={['x']}
          data={[
            { x: 1, y: 10, g: 'a' },
            { x: 1, y: 5, g: 'b' },
            { x: 1, y: 3, g: 'c' },
            { x: 1, y: 10, g: 'd' },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  })
  .add('negative and positive x values', () => {
    return (
      <Chart renderer="canvas" className={'story-chart'}>
        <Axis id={getAxisId('bottom')} position={Position.Bottom} title={'Bottom axis'} />
        <Axis
          id={getAxisId('left2')}
          title={'Left axis'}
          position={Position.Left}
          tickFormat={(d) => Number(d).toFixed(2)}
        />

        <BarSeries
          id={getSpecId('bars')}
          xScaleType={ScaleType.Linear}
          yScaleType={ScaleType.Linear}
          xAccessor="x"
          yAccessors={['y']}
          splitSeriesAccessors={['g']}
          stackAccessors={['x']}
          data={[
            { x: -3, y: 1 },
            { x: 0, y: 4 },
            { x: -2, y: 2 },
            { x: 1, y: 3 },
            { x: 2, y: 2 },
            { x: -1, y: 3 },
            { x: 3, y: 1 },
          ]}
          yScaleToDataExtent={false}
        />
      </Chart>
    );
  });
