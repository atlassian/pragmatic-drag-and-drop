/** @jsx jsx */

import { DragEventHandler, Fragment, useCallback, useState } from 'react';

import { css, jsx } from '@emotion/react';

import Badge from '@atlaskit/badge';
import { token } from '@atlaskit/tokens';

const itemInfoStyles = css({
  display: 'grid',
  width: '-webkit-fill-available',
  padding: 24,
  gap: 8,
  background: token('elevation.surface.sunken', '#F7F8F9'),
  borderRadius: 4,
});

const ItemInfo = ({
  kind,
  type,
  file,
}: {
  kind: string;
  type: string;
  file: File | null;
}) => {
  return (
    <div css={itemInfoStyles}>
      <div>kind = {kind}</div>
      <div>type = {type}</div>
      {file !== null && (
        <Fragment>
          <div>name = {file.name}</div>
        </Fragment>
      )}
    </div>
  );
};

const fileDropZoneStyles = css({
  display: 'flex',
  width: 300,
  padding: 24,
  alignItems: 'flex-start',
  gap: 16,
  flexDirection: 'column',
  background: token('elevation.surface', '#FFF'),
  border: `2px solid ${token('color.border', '#091E4224')}`,
  borderRadius: 6,
});

const FileDropZone = () => {
  const [items, setItems] = useState<DataTransferItem[]>([]);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback(event => {
    event.preventDefault();
  }, []);

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(event => {
    event.preventDefault();
    setItems(Array.from(event.dataTransfer.items));
  }, []);

  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-testid="drop-zone"
      css={fileDropZoneStyles}
    >
      <p>
        <Badge appearance="primary">{items.length}</Badge> items dropped.
      </p>
      {items.map((item, index) => (
        <ItemInfo
          key={index}
          kind={item.kind}
          type={item.type}
          file={item.getAsFile()}
        />
      ))}
    </div>
  );
};

const layoutStyles = css({
  display: 'grid',
  paddingTop: 48,
  placeItems: 'center',
});

export default function Example() {
  return (
    <div css={layoutStyles}>
      <FileDropZone />
    </div>
  );
}
