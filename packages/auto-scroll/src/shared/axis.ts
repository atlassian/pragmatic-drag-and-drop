const vertical = {
	start: 'top',
	end: 'bottom',
	point: 'y',
	size: 'height',
} as const;

const horizontal = {
	start: 'left',
	end: 'right',
	point: 'x',
	size: 'width',
} as const;

export const axisLookup: {
    readonly vertical: {
        readonly mainAxis: {
            readonly start: "top";
            readonly end: "bottom";
            readonly point: "y";
            readonly size: "height";
        };
        readonly crossAxis: {
            readonly start: "left";
            readonly end: "right";
            readonly point: "x";
            readonly size: "width";
        };
    }; readonly horizontal: {
        readonly mainAxis: {
            readonly start: "left";
            readonly end: "right";
            readonly point: "x";
            readonly size: "width";
        };
        readonly crossAxis: {
            readonly start: "top";
            readonly end: "bottom";
            readonly point: "y";
            readonly size: "height";
        };
    };
} = {
	vertical: {
		mainAxis: vertical,
		crossAxis: horizontal,
	},
	horizontal: {
		mainAxis: horizontal,
		crossAxis: vertical,
	},
} as const;
