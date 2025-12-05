from drf_spectacular.utils import extend_schema_view, extend_schema


def add_viewset_tags(tag_name, model_name):
    """Utility function to add consistent tags to ViewSets including custom actions"""
    
    # This decorator will apply tags to all methods in the viewset
    def decorator(cls):
        # Apply tags to standard CRUD operations
        cls = extend_schema_view(
            list=extend_schema(
                tags=[tag_name],
                summary=f'List {model_name}',
                description=f'Get list of all {model_name.lower()} with filtering and search capabilities'
            ),
            create=extend_schema(
                tags=[tag_name],
                summary=f'Create {model_name}',
                description=f'Create a new {model_name.lower()} record'
            ),
            retrieve=extend_schema(
                tags=[tag_name],
                summary=f'Get {model_name}',
                description=f'Retrieve a specific {model_name.lower()} by ID'
            ),
            update=extend_schema(
                tags=[tag_name],
                summary=f'Update {model_name}',
                description=f'Update a {model_name.lower()} record completely'
            ),
            partial_update=extend_schema(
                tags=[tag_name],
                summary=f'Partial Update {model_name}',
                description=f'Partially update a {model_name.lower()} record'
            ),
            destroy=extend_schema(
                tags=[tag_name],
                summary=f'Delete {model_name}',
                description=f'Delete a {model_name.lower()} record'
            ),
        )(cls)
        
        # Apply tags to all custom @action methods
        for attr_name in dir(cls):
            attr = getattr(cls, attr_name)
            if hasattr(attr, 'mapping'):  # This is an @action decorated method
                # Wrap the action with extend_schema to add tags
                original_method = getattr(cls, attr_name)
                wrapped_method = extend_schema(tags=[tag_name])(original_method)
                setattr(cls, attr_name, wrapped_method)
        
        return cls
    
    return decorator
