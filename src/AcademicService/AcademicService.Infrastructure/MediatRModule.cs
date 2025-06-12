using System.Reflection;
using Autofac;
using MediatR;
using Module = Autofac.Module;

namespace AcademicService.Infrastructure;

public class MediatRModule(params Assembly[] assemblies) : Module
{
    protected override void Load(ContainerBuilder builder)
    {
        builder.RegisterAssemblyTypes(typeof(IMediator).GetTypeInfo().Assembly).AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(typeof(IMediator).GetTypeInfo().Assembly)
            .AsClosedTypesOf(typeof(IRequestHandler<,>))
            .AsImplementedInterfaces();

        builder.RegisterAssemblyTypes(assemblies)
            .AsClosedTypesOf(typeof(IRequestHandler<,>))
            .AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(assemblies)
            .AsClosedTypesOf(typeof(IRequestHandler<>))
            .AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(assemblies)
            .AsClosedTypesOf(typeof(INotificationHandler<>))
            .AsImplementedInterfaces();
        
        builder.RegisterAssemblyTypes(assemblies)
            .AsClosedTypesOf(typeof(IPipelineBehavior<,>))
            .AsImplementedInterfaces();
    }
    
}