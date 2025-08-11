const tasksDefinitions = [
    // Baseline
    {
        "sequence_length": 5,
        "num_characters": 3,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new"
        ]
    },/*
    {
        "sequence_length": 5,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig"
        ]
    },*/
    // Easy
    /*{
        "sequence_length": 5,
        "num_characters": 3,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->new"
        ]
    },*/
    {
        "sequence_length": 5,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig"
        ]
    },
    {
        "sequence_length": 5,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "merged->new"
        ]
    },
    // Medium
    /*
    {
        "sequence_length": 5,
        "num_characters": 5,
        "alphabeth": "full",
        "substitutions": [
            "orig->orig",
            "orig->orig",
            "merged->new"
        ]
    },
    */
    {
        "sequence_length": 6,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    {
        "sequence_length": 6,
        "num_characters": 5,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    {
        "sequence_length": 6,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    // Hard
    /*{
        "sequence_length": 7,
        "num_characters": 5,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "orig->orig",
            "merged->new"
        ]
    },*/
    {
        "sequence_length": 7,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig",
            "merged->orig"
        ]
    },
    {
        "sequence_length": 7,
        "num_characters": 7,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "merged->new",
            "added->orig"
        ]
    }/*,
    // Very hard
    {
        "sequence_length": 7,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new",
            "added->orig"
        ]
    },
    {
        "sequence_length": 8,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->orig",
            "added->new"
        ]
    },
    {
        "sequence_length": 8,
        "num_characters": 8,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    }*/
]

/*
const tasksDefinitions = [
    {
        "sequence_length": 5,
        "num_characters": 3,
        "alphabeth": "vocals",
        "substitutions": [
            "orig->new",
            "added->orig",
        ]
    },
    {
        "sequence_length": 5,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "merged->new"
        ]
    },
    {
        "sequence_length": 5,
        "num_characters": 4,
        "alphabeth": "full",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    {
        "sequence_length": 6,
        "num_characters": 4,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig",
            "merged->orig"
        ]
    },
    {
        "sequence_length": 6,
        "num_characters": 5,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig",
            "merged->orig"
        ]
    },
    {
        "sequence_length": 6,
        "num_characters": 5,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    {
        "sequence_length": 7,
        "num_characters": 5,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig",
            "merged->orig"
        ]
    },
    {
        "sequence_length": 7,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "added->orig",
            "merged->orig"
        ]
    },
    {
        "sequence_length": 7,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->orig",
            "orig->new",
            "merged->new"
        ]
    },
    {
        "sequence_length": 8,
        "num_characters": 6,
        "alphabeth": "consonants",
        "substitutions": [
            "orig->new",
            "orig->orig",
            "added->orig",
            "merged->new"
        ]
    }
]
*/