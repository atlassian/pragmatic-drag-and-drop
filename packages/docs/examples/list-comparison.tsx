/* eslint-disable @atlaskit/design-system/no-nested-styles */
/** @jsx jsx */
import { Fragment, ReactNode } from 'react';

import { css, jsx, SerializedStyles } from '@emotion/react';

import Code from '@atlaskit/code/inline';
import Grid, { GridItem } from '@atlaskit/grid';
import Lozenge from '@atlaskit/lozenge';
import { Box, Stack, xcss } from '@atlaskit/primitives';
import Tabs, {
  TabPanel as AkTabPanel,
  Tab,
  TabList,
  TabPanelProps,
} from '@atlaskit/tabs';
import { fontFallback } from '@atlaskit/theme/typography';
import { token } from '@atlaskit/tokens';

import AsanaFields from './pieces/pinned-fields/experience/asana';
import AsanaFieldsWithNativePreview from './pieces/pinned-fields/experience/asana-native-preview';
import PinnedFieldsWithCurrentGuidelines from './pieces/pinned-fields/experience/current-guidelines';
import PinnedFieldsWithCurrentGuidelinesA11yAlwaysVisible from './pieces/pinned-fields/experience/current-guidelines-a11y-always-visible';
import PinnedFieldsWithCurrentGuidelinesA11yKeyboardOnly from './pieces/pinned-fields/experience/current-guidelines-a11y-keyboard-only';
import PinnedFieldsEnhancedDragHandle from './pieces/pinned-fields/experience/enhanced-drag-handle';
import PinnedFieldsMigrationLayer, {
  PinnedFieldReactBeautifulDndNoDraggingOutline,
  PinnedFieldReactBeautifulDndSubtle,
} from './pieces/pinned-fields/experience/migration-layer';
import PinnedFieldReactBeautifulDnd from './pieces/pinned-fields/experience/react-beautiful-dnd';
import SubtaskCurrentGuidelines from './pieces/subtasks/demo/current-guidelines';
import SubtasksCurrentGuidelinesA11yAlwaysVisible from './pieces/subtasks/demo/current-guidelines-a11y-always-visible';
import SubtasksCurrentGuidelinesA11yKeyboardOnly from './pieces/subtasks/demo/current-guidelines-a11y-keyboard-only';
import SubtaskEnhanced from './pieces/subtasks/demo/enhancements';
import LinearTaskReordering from './pieces/subtasks/demo/linear';
import LinearTaskReorderingNativePreview from './pieces/subtasks/demo/linear-native-preview';
import SubtasksMigrationLayer from './pieces/subtasks/demo/migration-layer';
import SubtasksNotion from './pieces/subtasks/demo/notion';
import SubtaskReactBeautifulDnd from './pieces/subtasks/demo/react-beautiful-dnd';

const itemStyles = xcss({
  border: `2px solid ${token('color.border.accent.purple', 'purple')}`,
  padding: 'space.200',
  borderRadius: 'border.radius.300',
  height: '100%', // ensure all grid items are the same height regardless of content

  width: '100%',
});

const itemBackgroundStyles = xcss({ backgroundColor: 'elevation.surface' });

function Item({
  children,
  borderColor,
  hasTransparentBackground = false,
}: {
  children: ReactNode;
  borderColor?: string;
  hasTransparentBackground?: boolean;
}) {
  return (
    <Box
      xcss={[itemStyles, !hasTransparentBackground && itemBackgroundStyles]}
      style={{ borderColor }}
    >
      <Stack space="space.400" alignInline="center">
        {children}
      </Stack>
    </Box>
  );
}

const itemPreviewStyles = xcss({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
  justifyContent: 'center',
  // maxWidth: 800,
  width: '100%',
  gap: 'space.200',
});

function ItemPreview({ children }: { children: ReactNode }) {
  return <Box xcss={itemPreviewStyles}>{children}</Box>;
}

type Solution = 'pdnd' | 'rbd';

const solutionLabels: { [Key in Solution]: string } = {
  pdnd: 'pragmatic-drag-and-drop',
  rbd: 'react-beautiful-dnd',
};

const solutionLabelStyles = css({
  border: '2px solid transparent',
  fontWeight: 500,
  padding: '4px 8px',
  borderRadius: 999,
});

const solutionLabelColorStyles: Record<Solution, SerializedStyles> = {
  pdnd: css({
    color: token('color.text.discovery', 'purple'),
    borderColor: token('color.border.discovery', 'purple'),
  }),
  rbd: css({
    color: token('color.text.accent.magenta', 'magenta'),
    borderColor: token('color.border.accent.magenta', 'magenta'),
  }),
};

const tableStyles = css({
  tableLayout: 'auto',
  tbody: {
    borderBottom: 'none',
  },
  'tr > td': {
    width: '100%',
  },
});

const itemCaptionHeadingStyles = css({
  fontWeight: token('font.weight.bold', 'bold'),
});

const itemCaptionTableRowStyles = css({
  '> th, > td': {
    paddingBlock: 8,
  },
});

const itemCaptionStyles = xcss({
  width: '100%',
  maxWidth: '800px',
});

function ItemCaption({
  title,
  poweredBy,
  accessibility,
  other,
}: {
  title: ReactNode;
  poweredBy: Solution;
  accessibility: ReactNode;
  other?: ReactNode;
}) {
  return (
    <Box xcss={itemCaptionStyles}>
      <Stack space="space.200">
        <h3 css={itemCaptionHeadingStyles}>{title}</h3>

        <table css={tableStyles}>
          <tbody>
            <tr css={itemCaptionTableRowStyles}>
              <th>Powered by</th>
              <td>
                <span
                  css={[
                    solutionLabelStyles,
                    solutionLabelColorStyles[poweredBy],
                  ]}
                >
                  {solutionLabels[poweredBy]}
                </span>
              </td>
            </tr>
            <tr css={itemCaptionTableRowStyles}>
              <th>Accessibility</th>
              <td>{accessibility}</td>
            </tr>
            {other ? (
              <tr css={itemCaptionTableRowStyles}>
                <th>Other</th>
                <td>{other}</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Stack>
    </Box>
  );
}

const bigTitleStyles = css({
  font: token('font.heading.xxlarge', fontFallback.heading.xxlarge),
  fontWeight: token('font.weight.bold', 'bold'),
  margin: 0,
});

const sectionStyles = xcss({
  paddingBlock: 'space.800',
  ':first-of-type': {
    border: 'none',
  },
});

function Section({
  children,
  backgroundColor,
}: {
  children: ReactNode;
  backgroundColor?: string;
}) {
  return (
    <Box xcss={sectionStyles} style={{ backgroundColor }}>
      <Stack space="space.400">{children}</Stack>
    </Box>
  );
}

const sectionHeaderStyles = xcss({
  textAlign: 'center',
});

const sectionHeaderDescriptionStyles = css({
  font: token('font.heading.medium', fontFallback.heading.medium),
  color: token('color.text.subtle', 'currentColor'),
});

function SectionHeader({
  elementBefore,
  title,
  description,
}: {
  elementBefore?: ReactNode;
  title: string;
  description: ReactNode;
}) {
  return (
    <Box xcss={sectionHeaderStyles}>
      {elementBefore}
      <h2
        css={bigTitleStyles}
        style={elementBefore ? { marginTop: '24px' } : undefined}
      >
        {title}
      </h2>
      <p css={sectionHeaderDescriptionStyles}>{description}</p>
    </Box>
  );
}

const subSectionHeaderStyles = xcss({
  marginTop: token('space.400', '16px'),
  textAlign: 'center',
});

const subSectionHeaderTitleStyles = css({
  font: token('font.heading.large', fontFallback.heading.large),
  fontWeight: token('font.weight.bold', 'bold'),
});

const subSectionHeaderDescriptionStyles = css({
  font: token('font.body.large', fontFallback.body.large),
  fontWeight: token('font.weight.medium', 'medium'),
  color: token('color.text.subtle', 'currentColor'),
  maxWidth: '70ch',
  marginInline: 'auto',
});

function SubSectionHeader({
  title,
  description,
}: {
  title: ReactNode;
  description: ReactNode;
}) {
  return (
    <Box xcss={subSectionHeaderStyles}>
      <h3 css={subSectionHeaderTitleStyles}>{title}</h3>
      <p css={subSectionHeaderDescriptionStyles}>{description}</p>
    </Box>
  );
}

const containerStyles = xcss({
  // same as grid spacing
  // padding: 'space.400',
});

const gridItem = {
  default: {
    span: { md: 12, lg: 8 },
    centerStart: { md: 1, lg: 3 },
  },
} as const;

const smallGridItemSpan = { sm: 12, md: 6 } as const;

const tabPanelStyles = css({
  marginTop: 16,
  width: '100%',
});

function TabPanel({ children, ...props }: TabPanelProps) {
  return (
    <AkTabPanel {...props}>
      <div css={tabPanelStyles}>{children}</div>
    </AkTabPanel>
  );
}

export default function ListComparison() {
  // TODO: figure out which breakpoints would be nicest
  return (
    <Box xcss={containerStyles}>
      <Stack space="space.0">
        <Section>
          <SectionHeader
            title="Current options"
            description="These are the options available based on our current outputs and
          guidelines"
          />

          <SubSectionHeader
            title={<Code>react-beautiful-dnd</Code>}
            description="The drag and drop library currently being used."
          />

          <Grid>
            <GridItem
              span={gridItem.default.span}
              start={gridItem.default.centerStart}
            >
              <Item
                borderColor={token('color.border.accent.magenta', 'magenta')}
              >
                <ItemPreview>
                  <PinnedFieldReactBeautifulDnd />
                  <SubtaskReactBeautifulDnd />
                </ItemPreview>
                <ItemCaption
                  title={'Existing experience'}
                  poweredBy="rbd"
                  accessibility={
                    <span>
                      Leverages directional keyboard movements.{' '}
                      <a href="https://youtu.be/5SQkOyzZLHM?t=2223">
                        This approach is a good stepping stone, but not ideal
                      </a>
                    </span>
                  }
                />
              </Item>
            </GridItem>
          </Grid>

          <SubSectionHeader
            title={
              <Fragment>
                <Code>react-beautiful-dnd</Code> → Migration layer →{' '}
                <Code>pragmatic-drag-and-drop</Code>
              </Fragment>
            }
            description={
              <Fragment>
                The migration layer allows for a safe and automatic upgrade path
                from <Code>react-beautiful-dnd</Code> to{' '}
                <Code>pragmatic-drag-and-drop</Code> but needs to make some
                additional compromises.
              </Fragment>
            }
          />

          <Grid>
            <GridItem
              span={gridItem.default.span}
              start={gridItem.default.centerStart}
            >
              <Tabs id="default">
                <TabList>
                  <Tab>Basic</Tab>
                  <Tab>Variant: subtle</Tab>
                  <Tab>Variant: subtler</Tab>
                </TabList>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldsMigrationLayer />
                      <SubtasksMigrationLayer />
                    </ItemPreview>
                    <ItemCaption
                      title="Migration layer"
                      poweredBy="pdnd"
                      accessibility={
                        <span>
                          Same as <Code>react-beautiful-dnd</Code>
                        </span>
                      }
                      other={
                        <Fragment>
                          <p>
                            The blue background and border visible while
                            dragging pinned fields is <strong>not</strong> added
                            by the migration layer. It is custom styling added
                            in Jira and can be freely modified. Variations on
                            this styling are provided for reference.
                          </p>
                          <p>
                            Note that the small padding on the subtask container
                            has been removed. This ensures that the drop
                            indicator is flush against the edge at the top and
                            bottom.
                          </p>
                        </Fragment>
                      }
                    />
                  </Item>
                </TabPanel>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldReactBeautifulDndNoDraggingOutline />
                    </ItemPreview>
                    <ItemCaption
                      title="Migration layer (subtle variant)"
                      poweredBy="pdnd"
                      accessibility={
                        <span>
                          Same as <Code>react-beautiful-dnd</Code>
                        </span>
                      }
                      other={
                        <Fragment>
                          This variant removes the blue border that was visible
                          while dragging.
                        </Fragment>
                      }
                    />
                  </Item>
                </TabPanel>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldReactBeautifulDndSubtle />
                    </ItemPreview>
                    <ItemCaption
                      title="Migration layer (subtler variant)"
                      poweredBy="pdnd"
                      accessibility={
                        <span>
                          Same as <Code>react-beautiful-dnd</Code>
                        </span>
                      }
                      other={
                        <Fragment>
                          This variant also makes the blue background that was
                          visible while dragging subtler.
                        </Fragment>
                      }
                    />
                  </Item>
                </TabPanel>
              </Tabs>
            </GridItem>
          </Grid>

          <SubSectionHeader
            title="Manual migration"
            description="These are examples of a manual migration using our current drag and drop visual guidelines"
          />

          <Grid>
            <GridItem
              span={gridItem.default.span}
              start={gridItem.default.centerStart}
            >
              <Tabs id="manual-migration">
                <TabList>
                  <Tab>Simplified</Tab>
                  <Tab>Accessibility: always visible</Tab>
                  <Tab>Accessibility: visible on focus</Tab>
                </TabList>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldsWithCurrentGuidelines />
                      <SubtaskCurrentGuidelines />
                    </ItemPreview>
                    <ItemCaption
                      title="Current guidelines"
                      poweredBy="pdnd"
                      accessibility="Not wired up for this example. See following examples to see accessibility options"
                    />
                  </Item>
                </TabPanel>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldsWithCurrentGuidelinesA11yAlwaysVisible />
                      <SubtasksCurrentGuidelinesA11yAlwaysVisible />
                    </ItemPreview>
                    <ItemCaption
                      title="Current guidelines with visible action menu"
                      poweredBy="pdnd"
                      accessibility={
                        <Fragment>
                          A visible menu button is used to trigger all possible
                          actions
                        </Fragment>
                      }
                      other={
                        <Fragment>
                          During user testing it was found that using menus had
                          superior accessibility characteristics to the{' '}
                          <Code>react-beautiful-dnd</Code> style keyboard
                          controls. The action menu pattern is also cheap and
                          more flexible.
                        </Fragment>
                      }
                    />
                  </Item>
                </TabPanel>
                <TabPanel>
                  <Item>
                    <ItemPreview>
                      <PinnedFieldsWithCurrentGuidelinesA11yKeyboardOnly />
                      <SubtasksCurrentGuidelinesA11yKeyboardOnly />
                    </ItemPreview>
                    <ItemCaption
                      title="Current guidelines with on-focus three dots"
                      poweredBy="pdnd"
                      accessibility={
                        <Fragment>
                          An action menu button is only visible when a draggable
                          item receives focus. This has the same great
                          accessibility as always having the action menu button
                          always visible, but does not clutter the interface
                        </Fragment>
                      }
                    />
                  </Item>
                </TabPanel>
              </Tabs>
            </GridItem>
          </Grid>
        </Section>

        <Section backgroundColor={token('color.background.success', '')}>
          <SectionHeader
            elementBefore={
              <Lozenge appearance="success" isBold>
                Our recommendation
              </Lozenge>
            }
            title="Evolving our guidelines"
            description="Exploring how we can evolve our current outputs and guidelines"
          />

          <Grid>
            <GridItem
              span={gridItem.default.span}
              start={gridItem.default.centerStart}
            >
              <Item borderColor={token('color.border.success', undefined)}>
                <ItemPreview>
                  {/* <PinnedFieldsEnhancedDragHandleHidden /> */}
                  {/* <PinnedFieldsPdndEnhanced /> */}
                  <PinnedFieldsEnhancedDragHandle />
                  <SubtaskEnhanced />
                </ItemPreview>
                <ItemCaption
                  title="Ideas for variation"
                  poweredBy="pdnd"
                  accessibility={
                    <Fragment>
                      <p>
                        The drag handle also functions as a menu button which is
                        used for accessibility.
                      </p>
                      <ul>
                        <li>
                          Dragging from the drag handle will initiate a drag and
                          drop operation.
                        </li>
                        <li>
                          Clicking the drag handle will open a dropdown menu
                          which provides an alternative flow for reordering.
                        </li>
                      </ul>
                    </Fragment>
                  }
                  other={
                    <Fragment>
                      <p>
                        This example introduces a few affordances for improving
                        the experience:
                      </p>
                      <table style={{ tableLayout: 'fixed' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '33.3%' }}>Affordance</th>
                            <th style={{ width: '33.3%' }}>Effect</th>
                            <th style={{ width: '33.3%' }}>Note(s)</th>
                          </tr>
                        </thead>
                        <tbody
                          // eslint-disable-next-line @atlaskit/design-system/consistent-css-prop-usage
                          css={{
                            '> tr:nth-of-type(2n)': {
                              background: token('color.background.neutral', ''),
                            },
                          }}
                        >
                          <tr>
                            <td>Adding a drag handle</td>
                            <td>
                              <ul>
                                <li>Indicates the item is draggable</li>
                                <li>
                                  Doubles as a menu button for accessibility
                                </li>
                              </ul>
                            </td>
                            <td>
                              For this example, we have changed the drag handle
                              icon on subtasks.
                            </td>
                          </tr>
                          <tr>
                            <td>
                              Flashing selected background color on drop (
                              <Code>color.background.selected</Code>)
                            </td>
                            <td>Highlights which item was dropped</td>
                            <td>Inspired by Linear</td>
                          </tr>
                          <tr>
                            <td>
                              Adding a terminal to the drop indicator, that
                              sticks out past the item
                            </td>
                            <td>
                              Improves the visibility of the drop indicator
                            </td>
                            <td></td>
                          </tr>
                          <tr>
                            <td>
                              Using a condensed representation of the item as a
                              preview while dragging
                            </td>
                            <td>
                              <ul>
                                <li>
                                  Improves the visibility of the drop indicator
                                </li>
                                <li>
                                  Generally avoids large items from obscuring
                                  the screen
                                </li>
                              </ul>
                            </td>
                            <td>
                              The exact representation used for the preview
                              would be a product decision
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Fragment>
                  }
                />
              </Item>
            </GridItem>
          </Grid>
        </Section>

        <Section>
          <SectionHeader
            title="Clones"
            description={
              <Fragment>
                Using <Code>pragmatic-drag-and-drop</Code> to power completely
                alternative experiences.
                <br />
                This is to demonstrate the flexibility that{' '}
                <Code>pragmatic-drag-and-drop</Code> gives us.
              </Fragment>
            }
          />
          <Grid>
            <GridItem span={smallGridItemSpan}>
              <Item>
                <ItemPreview>
                  <AsanaFields />
                </ItemPreview>
                <ItemCaption
                  title="Clone: Asana (custom preview)"
                  poweredBy="pdnd"
                  accessibility="🚫 Asana's field reordering does not seem to be accessible."
                  other={
                    <Fragment>
                      <p>
                        This variation uses a custom drag preview that closely
                        mirrors that of the real Asana field reordering.
                      </p>
                      <p>
                        A custom drag preview increases control over the look
                        and feel.
                      </p>
                      <p>
                        The use of a custom drag preview here allows it to be
                        completely detached from the user's pointer. You can see
                        this if you drag from the right edge of a field.
                      </p>
                    </Fragment>
                  }
                />
              </Item>
            </GridItem>
            <GridItem span={smallGridItemSpan}>
              <Item>
                <ItemPreview>
                  <AsanaFieldsWithNativePreview />
                </ItemPreview>
                <ItemCaption
                  title="Clone: Asana (native preview)"
                  poweredBy="pdnd"
                  accessibility="🚫 Asana's field reordering does not seem to be accessible."
                  other={
                    <Fragment>
                      <p>
                        This variation uses a native drag preview and less
                        closely resembles Asana.
                      </p>
                      <p>
                        A native drag preview takes away some control. The
                        browser will:
                      </p>
                      <ul>
                        <li>Add transparency</li>
                        <li>Add a drop shadow</li>
                        <li>
                          Move the preview so it is connected to the user's
                          pointer
                        </li>
                      </ul>
                    </Fragment>
                  }
                />
              </Item>
            </GridItem>
            <GridItem span={smallGridItemSpan}>
              <Item>
                <ItemPreview>
                  <LinearTaskReordering />
                </ItemPreview>
                <ItemCaption
                  title="Clone: Linear (custom preview)"
                  poweredBy="pdnd"
                  accessibility={
                    <Fragment>
                      <p>
                        Linear provides custom keyboard controls to reorder
                        tasks (<Code>⌥ Option</Code> + arrow keys). The
                        accessibility of this is questionable, as there are no
                        instructions for it.
                      </p>
                      <p>These keyboard controls have not been implemented.</p>
                    </Fragment>
                  }
                  other={
                    <Fragment>
                      <p>
                        This clone of Linear uses custom drag previews. Linear's
                        drag previews have some interesting properties:
                      </p>
                      <ul>
                        <li>They are much smaller than the draggable source</li>
                        <li>
                          They appear in a position that overlays the draggable
                          source
                        </li>
                        <li>
                          They will slide to under the user's pointer if they
                          are not at the start
                        </li>
                      </ul>
                    </Fragment>
                  }
                />
              </Item>
            </GridItem>

            <GridItem span={smallGridItemSpan}>
              <Item>
                <ItemPreview>
                  <LinearTaskReorderingNativePreview />
                </ItemPreview>
                <ItemCaption
                  title="Clone: Linear (native preview)"
                  poweredBy="pdnd"
                  accessibility={
                    <Fragment>
                      <p>
                        Linear provides custom keyboard controls to reorder
                        tasks (<Code>⌥ Option</Code> + arrow keys). The
                        accessibility of this is questionable, as there are no
                        instructions for it.
                      </p>
                      <p>These keyboard controls have not been implemented.</p>
                    </Fragment>
                  }
                  other={
                    <p>
                      This variation uses a native drag preview. There is less
                      control over the drag preview, but it is much easier to
                      achieve and performs more smoothly.
                    </p>
                  }
                />
              </Item>
            </GridItem>

            <GridItem span={smallGridItemSpan} start={{ sm: 1, md: 4 }}>
              <Item hasTransparentBackground>
                <ItemPreview>
                  <SubtasksNotion />
                </ItemPreview>
                <ItemCaption
                  title="Clone: Notion"
                  poweredBy="pdnd"
                  accessibility="🚫 Notion's task reordering does not seem to be accessible."
                  other={
                    <Fragment>
                      <p>
                        Interestingly Notion uses a native preview and applies{' '}
                        <strong>extra</strong> transparency to it.
                      </p>
                    </Fragment>
                  }
                />
              </Item>
            </GridItem>
          </Grid>
        </Section>
      </Stack>
    </Box>
  );
}
