import { CircularProgress, Typography, Box } from "@mui/material"

function CircularProgressWithLabel(props) {
	return (
		<div>
			<Box sx={{ position: "relative", display: "inline-flex" }}>
				<CircularProgress variant="determinate" {...props} />
				<Box
					sx={{
						top: 0,
						left: 0,
						bottom: 0,
						right: 0,
						position: "absolute",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography variant="caption" component="div" color="text.secondary">
						{`${props.value}%`}
					</Typography>
				</Box>
			</Box>
		</div>
	)
}

export default CircularProgressWithLabel