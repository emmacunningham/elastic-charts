import {
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiText,
  EuiToolTip,
} from '@elastic/eui';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { LegendItem } from '../lib/series/legend';
import { Position } from '../lib/series/specs';
import { ChartStore } from '../state/chart_state';

interface ReactiveChartProps {
  chartStore?: ChartStore; // FIX until we find a better way on ts mobx
}

function getCollapseArrowType(
  position: Position | undefined,
  legendShown: boolean,
): 'arrowRight' | 'arrowLeft' | 'arrowDown' | 'arrowUp' {
  switch (position) {
    case Position.Left:
      return legendShown ? 'arrowRight' : 'arrowLeft';
    case Position.Bottom:
      return legendShown ? 'arrowUp' : 'arrowDown';
    case Position.Right:
      return legendShown ? 'arrowLeft' : 'arrowRight';
    case Position.Top:
      return legendShown ? 'arrowDown' : 'arrowUp';
    default:
      return 'arrowRight';
  }
}

class LegendComponent extends React.Component<ReactiveChartProps> {
  static displayName = 'Legend';

  onCollapseLegend = () => {
    this.props.chartStore!.toggleLegendCollapsed();
  }

  render() {
    const {
      initialized,
      legendItems,
      legendPosition,
      showLegend,
      legendCollapsed,
      debug,
    } = this.props.chartStore!;

    if (!showLegend.get() || !initialized.get() || legendItems.length === 0) {
      return null;
    }

    const legendClasses = classNames(
      'euiChartLegend',
      `euiChartLegend--${legendPosition}`,
      legendCollapsed.get() && 'euiChartLegend--collapsed',
      debug && 'euiChartLegend--debug',
    );

    const legendCollapser = classNames(
      'euiChartLegendCollapser',
      `euiChartLegendCollapser--${legendPosition}`,
    );
    const collapseArrowType = getCollapseArrowType(legendPosition, legendCollapsed.get());

    return (
      <div className={legendClasses}>
        <div className={legendCollapser}>
          <EuiButtonIcon
            onClick={this.onCollapseLegend}
            iconType={collapseArrowType}
            aria-label={legendCollapsed.get() ? 'Expand legend' : 'Collapse legend'}
          />
        </div>
        <div className="euiChartLegendList">
          <EuiFlexGroup
            gutterSize="s"
            wrap
            className="euiChartLegendListContainer"
            responsive={false}
          >
            {legendItems.map((item, index) => {
              const legendItemProps = {
                key: index,
                className: 'euiChartLegendList__item',
                onMouseOver: this.onLegendItemMouseover(index),
                onMouseOut: this.onLegendItemMouseout,
              };

              const { color, label } = item;

              return (
                <EuiFlexItem {...legendItemProps}>
                  {this.renderLegendElement({ color, label }, index)}
                </EuiFlexItem>
              );
            })}
          </EuiFlexGroup>
        </div>
      </div>
    );
  }

  private onLegendTitleClick = (legendItemIndex: number) => () => {
    this.props.chartStore!.updateSelectedLegendItem(legendItemIndex);
  }

  private onLegendItemMouseover = (legendItemIndex: number) => () => {
    this.props.chartStore!.onLegendItemOver(legendItemIndex);
  }

  private onLegendItemMouseout = () => {
    this.props.chartStore!.onLegendItemOut();
  }

  private renderLegendElement = ({ color, label }: Partial<LegendItem>, legendItemIndex: number) => {
    const onTitleClick = this.onLegendTitleClick(legendItemIndex);

    return (
      <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiIcon type="dot" color={color} />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiToolTip position="right" content={<EuiText size="xs">{label}</EuiText>}>
            <EuiFlexItem grow={true} className="euiChartLegendListItem__title" onClick={onTitleClick}>
              <EuiText size="xs" className="eui-textTruncate">
                {label}
              </EuiText>
            </EuiFlexItem>
          </EuiToolTip>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
  }
}
// function LegendElement({ color, label }: Partial<LegendItem>) {
//   return (
//     <EuiFlexGroup gutterSize="xs" alignItems="center" responsive={false}>
//       <EuiFlexItem grow={false}>
//         <EuiIcon type="dot" color={color} />
//       </EuiFlexItem>
//       <EuiFlexItem grow={false}>
//         <EuiToolTip position="right" content={<EuiText size="xs">{label}</EuiText>}>
//           <EuiFlexItem grow={true} className="euiChartLegendListItem__title" onClick={onLegendTitleClick}>
//             <EuiText size="xs" className="eui-textTruncate">
//               {label}
//             </EuiText>
//           </EuiFlexItem>
//         </EuiToolTip>
//       </EuiFlexItem>
//     </EuiFlexGroup>
//   );
// }

export const Legend = inject('chartStore')(observer(LegendComponent));
