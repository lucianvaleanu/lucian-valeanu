const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    testEnvironment: 'jsdom',
    testMatch: ['**/*.test.jsx'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': '<rootDir>/test/styleMock.js',
    },
}

module.exports = createJestConfig(customJestConfig)
