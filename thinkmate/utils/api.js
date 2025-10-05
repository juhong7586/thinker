// call apis
export const api = {
    // create student
    createStudent: async (name, email, studentColor) => {
        const response = await fetch('/api/students', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, studentColor }),
        })

        if (!response.ok) {
            throw new Error('Failed to create student')
        }
        // await?
        return response.json()
    },

    // get all students
    getStudents: async () => {
        const response = await fetch('/api/students')
        if (!response.ok) {
            throw new Error('Failed to fetch students')
        }
        return response.json()
    },

    // create interest
    createInterest: async (studentId, field, level, socialImpact) => {
        const response = await fetch('/api/interests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                studentId, 
                field, 
                level, 
                socialImpact, 
            }),
        })
        if (!response.ok) {
            throw new Error('Failed to create interest. Change information!')
        }
        return response.json()
    },

    // get all interests
    getInterests: async () => {
        const response = await fetch('/api/interests')
        if (!response.ok) {
            throw new Error('Failed to fetch interests')
        }
        return response.json()
    },

}