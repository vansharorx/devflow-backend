let issues = [];

const addIssue = (issue) => {
    issues.push(issue);
};

const getAllIssues = () => {
    return issues;
};

module.exports = {
    addIssue,
    getAllIssues
};