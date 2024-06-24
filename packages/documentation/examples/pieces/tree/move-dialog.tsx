/** @jsx jsx */

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

// eslint-disable-next-line @atlaskit/ui-styling-standard/use-compiled -- Ignored via go/DSP-18766
import { jsx } from '@emotion/react';
import invariant from 'tiny-invariant';

import Button from '@atlaskit/button/new';
import Form, { Field } from '@atlaskit/form';
import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle } from '@atlaskit/modal-dialog';
import Select from '@atlaskit/select';

import { TreeContext } from './tree-context';

type FormData = {
	parent: { value: string };
	position: { value: number };
};

export function MoveDialog({ onClose, itemId }: { onClose: () => void; itemId: string }) {
	const { dispatch, getChildrenOfItem, getMoveTargets, getPathToItem } = useContext(TreeContext);

	const options = useMemo(() => {
		const targets = getMoveTargets({ itemId });

		const targetOptions = targets.map((item) => {
			return { label: `Item ${item.id}`, value: item.id };
		});

		return [{ label: 'No parent', value: '' }, ...targetOptions];
	}, [getMoveTargets, itemId]);

	const defaultParent: { label: string; value: string } = useMemo(() => {
		const path = getPathToItem(itemId);
		const parentId = path[path.length - 1] ?? '';
		const option = options.find((option) => option.value === parentId);
		invariant(option);
		return option;
	}, [getPathToItem, itemId, options]);

	const [parentId, setParentId] = useState(defaultParent.value);
	const positionOptions = useMemo(() => {
		const targets = getChildrenOfItem(parentId).filter((item) => item.id !== itemId);
		return Array.from({ length: targets.length + 1 }, (_, index) => {
			/**
			 * Adding one to convert index to positions
			 */
			return { label: String(index + 1), value: index + 1 };
		});
	}, [getChildrenOfItem, itemId, parentId]);

	const onSubmit = useCallback(
		(formData: FormData) => {
			console.log('formData = ', formData);
			dispatch({
				type: 'modal-move',
				itemId,
				targetId: formData.parent.value,
				/**
				 * Subtract one to convert the position back to an index
				 */
				index: formData.position.value - 1,
			});
		},
		[dispatch, itemId],
	);

	const parentSelectRef = useRef(null);

	return (
		<Modal onClose={onClose} autoFocus={parentSelectRef}>
			<Form<FormData> onSubmit={onSubmit}>
				{({ formProps, setFieldValue }) => (
					<form {...formProps}>
						<ModalHeader>
							<ModalTitle>Move</ModalTitle>
						</ModalHeader>
						<ModalBody>
							<Field<{ value: string }>
								id="parent"
								name="parent"
								label="Parent"
								isRequired
								defaultValue={defaultParent}
							>
								{({ fieldProps }) => (
									<Select
										{...fieldProps}
										ref={parentSelectRef}
										onChange={(option) => {
											invariant(option !== null);
											setParentId(option.value);
											fieldProps.onChange(option);
										}}
										menuPosition="fixed"
										options={options}
									/>
								)}
							</Field>
							<PositionSelectField options={positionOptions} setFieldValue={setFieldValue} />
						</ModalBody>
						<ModalFooter>
							<Button appearance="subtle" onClick={onClose}>
								Cancel
							</Button>
							<Button appearance="primary" onClick={onClose} autoFocus type="submit">
								Move
							</Button>
						</ModalFooter>
					</form>
				)}
			</Form>
		</Modal>
	);
}

function PositionSelectField({
	options,
	setFieldValue,
}: {
	options: readonly { label: string; value: number }[];
	setFieldValue: (name: string, value: any) => void;
}) {
	/**
	 * Whenever the options change we are resetting the value to the first value.
	 *
	 * This is to prevent an out of bounds selection.
	 */
	useEffect(() => {
		setFieldValue('position', options[0]);
	}, [options, setFieldValue]);

	return (
		<Field<{ value: number } | null>
			id="position"
			name="position"
			label="Position"
			isRequired
			defaultValue={options[0]}
		>
			{({ fieldProps }) => <Select {...fieldProps} menuPosition="fixed" options={options} />}
		</Field>
	);
}
