const dependencies = require('../src/utils/dependencies')

test('check-dependencies-elements', done => {
  expect.assertions(3)

  dependencies.getDependencies((err, data) => {
    expect(err).toBeNull()
    expect(data).toBeDefined()

    function check (elem) {
      const isTruthy = elem.title !== undefined && elem.main_version !== undefined &&
        elem.private_versions !== undefined && elem.parents !== undefined &&
        elem.vulnerabilities !== undefined
      if (!isTruthy) {
        console.log('Hello')
      }
      return isTruthy
    }

    expect(data.dependencies.every(check)).toBeTruthy()

    done()
  })
})
