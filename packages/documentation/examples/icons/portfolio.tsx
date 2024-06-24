import React from 'react';

import type { CustomGlyphProps } from '@atlaskit/icon/types';

export default (props: CustomGlyphProps) => (
	<svg
		{...props}
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
	>
		<mask
			id="mask0"
			mask-type="alpha"
			maskUnits="userSpaceOnUse"
			x="0"
			y="0"
			width="24"
			height="24"
		>
			<rect width="24" height="24" fill="white" />
		</mask>
		<g mask="url(#mask0)">
			<path
				d="M8.82929 17H15.1707C15.5825 15.8348 16.6938 15 18 15C19.6569 15 21 16.3431 21 18C21 19.6569 19.6569 21 18 21C16.6938 21 15.5825 20.1652 15.1707 19H8.82929C8.41746 20.1652 7.30622 21 6 21C4.34315 21 3 19.6569 3 18C3 16.3431 4.34315 15 6 15C7.30622 15 8.41746 15.8348 8.82929 17Z"
				fill="#36B37E"
			/>
			<rect x="3" y="3" width="16" height="3" rx="1.5" fill="#2684FF" />
			<rect x="8" y="9" width="13" height="3" rx="1.5" fill="#FFC400" />
			<rect width="24" height="24" rx="3" fill="#4E86EE" />
			<rect width="24" height="24" rx="3" fill="url(#paint0_linear)" />
			<mask
				id="mask1"
				mask-type="alpha"
				maskUnits="userSpaceOnUse"
				x="0"
				y="0"
				width="24"
				height="24"
			>
				<rect width="24" height="24" fill="white" />
			</mask>
			<g mask="url(#mask1)">
				<path
					d="M9.8862 15.3333H14.1138C14.3884 14.5565 15.1292 14 16 14C17.1046 14 18 14.8954 18 16C18 17.1046 17.1046 18 16 18C15.1292 18 14.3884 17.4435 14.1138 16.6667H9.8862C9.61164 17.4435 8.87081 18 8 18C6.89543 18 6 17.1046 6 16C6 14.8954 6.89543 14 8 14C8.87081 14 9.61164 14.5565 9.8862 15.3333Z"
					fill="white"
				/>
				<rect x="6" y="6" width="11" height="2" rx="1" fill="white" />
				<rect x="9" y="10" width="9" height="2" rx="1" fill="white" />
			</g>
		</g>
		<defs>
			<linearGradient
				id="paint0_linear"
				x1="12"
				y1="0"
				x2="12"
				y2="24"
				gradientUnits="userSpaceOnUse"
			>
				<stop stopColor="#4E86EE" />
				<stop offset="1" stopColor="#3562C1" />
			</linearGradient>
		</defs>
	</svg>
);
