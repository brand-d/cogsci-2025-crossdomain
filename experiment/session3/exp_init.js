// URL parameter name used for the participant ID (set to null if not used)
const PARTICIPANT_ID_PARAM_NAME = "PROLIFIC_PID";
// URL to direct a participant to if consent was not given
const REJECT_REDIRECT_URL = "no_consent_placeholder";
// URL to direct a participant to if the study was completed successfully
const COMPLETED_REDIRECT_URL = "completion_link_placeholder";

// Task sequences (must be relative to the main index file)
var tasks = [
	"tasks/wason_selection",
	"tasks/syllog",
	"tasks/spatial_4p_memory_allp",
	"tasks/carddir_sc",
	"tasks/carddir_interpretation",
	"end.html"
];

// Saves the task list in session storage
// This line is necessary for the flow of the experiment/study
// It is recommended to not alter this line
sessionStorage.setItem("exp_tasks", JSON.stringify(tasks));